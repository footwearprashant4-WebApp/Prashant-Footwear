import React, { useState } from 'react';
import { 
  Database, Trash2, AlertTriangle, CheckCircle2, RefreshCw, ShieldAlert, 
  Lock, Key, FileText, Package, ShoppingCart, Layers, TrendingUp,
  RotateCcw, Sparkles, Check, Info, ShieldCheck, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Product, Order, StockLedger } from '../types';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { INITIAL_PRODUCTS } from '../data/products';

interface DataManagementSectionProps {
  isDark: boolean;
  onRefreshParentState?: () => void;
}

export const DataManagementSection: React.FC<DataManagementSectionProps> = ({
  isDark,
  onRefreshParentState
}) => {
  const { currentUser } = useAuth();
  const { 
    products, 
    orders, 
    stockLedgers, 
    clearAllSalesOrders, 
    clearAllStockLedgers, 
    clearAllProducts,
    clearAllData,
    seedProductsDatabase
  } = useProducts();

  // Supervisor elevation state (in case logged-in account needs PIN elevation)
  const [supervisorPinInput, setSupervisorPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isPinElevated, setIsPinElevated] = useState(false);

  // Determine if the current session has Administrative Level privileges
  const isSuperAdminUser = 
    currentUser?.mobile === '9511244447' || 
    currentUser?.mobile === '9999999999' || 
    currentUser?.mobile === '9876543210' ||
    (currentUser as any)?.email === 'footwearprashant4@gmail.com' ||
    currentUser?.role === 'admin' ||
    isPinElevated;

  // Master reset configuration checkboxes
  const [clearOrdersOption, setClearOrdersOption] = useState(true);
  const [clearStockLedgersOption, setClearStockLedgersOption] = useState(true);
  const [clearWholesaleDemandsOption, setClearWholesaleDemandsOption] = useState(true);
  const [clearOffersOption, setClearOffersOption] = useState(true);
  const [clearCachesOption, setClearCachesOption] = useState(true);
  const [catalogHandlingMode, setCatalogHandlingMode] = useState<'zero_stock' | 'reset_sample' | 'wipe_empty'>('zero_stock');

  // Confirmation Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<{
    type: 'master_wipe' | 'orders_only' | 'ledgers_only' | 'zero_stock_only' | 'reset_catalog_only' | 'wipe_catalog_only' | 'demands_only' | 'offers_only';
    title: string;
    description: string;
    requiredPhrase: string;
  } | null>(null);

  const [confirmationPhraseInput, setConfirmationPhraseInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<string>('');
  const [successReport, setSuccessReport] = useState<{
    title: string;
    details: string[];
  } | null>(null);

  // Handle PIN elevation
  const handleVerifySupervisorPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (supervisorPinInput === '9999' || supervisorPinInput === 'Prashant' || supervisorPinInput === 'adminpassword') {
      setIsPinElevated(true);
      setPinError(null);
    } else {
      setPinError('Incorrect Administrative Supervisor PIN. Please enter "9999" or Administrator Password.');
    }
  };

  // Open confirmation modal for specific action
  const triggerActionConfirmation = (
    type: 'master_wipe' | 'orders_only' | 'ledgers_only' | 'zero_stock_only' | 'reset_catalog_only' | 'wipe_catalog_only' | 'demands_only' | 'offers_only',
    title: string,
    description: string,
    requiredPhrase: string = 'CLEAR DATA'
  ) => {
    setActionToConfirm({ type, title, description, requiredPhrase });
    setConfirmationPhraseInput('');
    setIsConfirmModalOpen(true);
  };

  // Execute the confirmed data operation
  const handleExecuteConfirmedAction = async () => {
    if (!actionToConfirm) return;
    setIsExecuting(true);
    setExecutionProgress('Initializing database operation...');

    try {
      if (actionToConfirm.type === 'master_wipe') {
        setExecutionProgress('Deleting sales orders and POS invoices from Firestore...');
        const details: string[] = [];

        if (clearOrdersOption) {
          const res = await clearAllSalesOrders();
          localStorage.removeItem('prashant_order_invoices_list');
          localStorage.removeItem('recent_billing_products');
          details.push(`Cleared ${res.count || orders.length} Sales & Billing Orders`);
        }

        if (clearStockLedgersOption) {
          setExecutionProgress('Clearing inward stock ledgers from Firestore...');
          const res = await clearAllStockLedgers();
          details.push(`Cleared ${res.count || stockLedgers.length} Inward Stock Ledgers`);
        }

        if (clearWholesaleDemandsOption) {
          setExecutionProgress('Clearing procurement demand trackers...');
          localStorage.removeItem('prashant_wholesale_demands_list');
          localStorage.removeItem('prashant_wholesale_demands_v1');
          details.push('Cleared All Wholesale Demands & Procurement Records');
        }

        if (clearOffersOption) {
          setExecutionProgress('Clearing promotional offers and clearance deals...');
          localStorage.removeItem('prashant_managed_offers');
          localStorage.setItem('prashant_product_clearance_offers', JSON.stringify([]));
          window.dispatchEvent(new CustomEvent('prashant_clearance_offers_updated', { detail: [] }));
          window.dispatchEvent(new Event('storage'));
          details.push('Cleared Promotional Offers & Clearance Discounts');
        }

        if (clearCachesOption) {
          setExecutionProgress('Flushing audit logs and offline caches...');
          localStorage.removeItem('prashant_audit_logs_v1');
          localStorage.removeItem('prashant_cached_orders');
          localStorage.removeItem('prashant_cached_stock_ledgers');
          localStorage.removeItem('prashant_customer_khata_v1');
          details.push('Flushed Local Storage & Operational Caches');
        }

        // Handle Product Catalog Choice
        if (catalogHandlingMode === 'zero_stock') {
          setExecutionProgress('Resetting product stock levels to 0 units...');
          for (const prod of products) {
            const zeroedSizeStock: Record<string, number> = {};
            prod.sizes.forEach((s) => {
              zeroedSizeStock[String(s)] = 0;
            });
            const zeroedSizeColorStock: Record<string, Record<string, number>> = {};
            prod.sizes.forEach((s) => {
              zeroedSizeColorStock[String(s)] = { '1': 0, '2': 0, '3': 0 };
            });

            await setDoc(
              doc(db, 'products', prod.id),
              {
                ...prod,
                stock: 0,
                sizeStock: zeroedSizeStock,
                sizeColorStock: zeroedSizeColorStock
              },
              { merge: true }
            );
          }
          details.push(`Retained ${products.length} Products with Stock Reset to 0 (Ready for Inward Goods)`);
        } else if (catalogHandlingMode === 'reset_sample') {
          setExecutionProgress('Restoring default initial sample catalog...');
          await seedProductsDatabase();
          details.push(`Restored Default Sample Catalog (${INITIAL_PRODUCTS.length} Styles)`);
        } else if (catalogHandlingMode === 'wipe_empty') {
          setExecutionProgress('Deleting all products from catalog...');
          const res = await clearAllProducts();
          details.push(`Wiped All ${res.count || products.length} Catalog Products`);
        }

        setSuccessReport({
          title: 'All Sample Data Successfully Cleared!',
          details
        });
      } else if (actionToConfirm.type === 'orders_only') {
        setExecutionProgress('Deleting all orders and sales records...');
        const res = await clearAllSalesOrders();
        localStorage.removeItem('prashant_order_invoices_list');
        localStorage.removeItem('recent_billing_products');
        setSuccessReport({
          title: 'Sales & POS Invoices Cleared',
          details: [`Removed ${res.count || orders.length} orders from Firestore and local cache.`]
        });
      } else if (actionToConfirm.type === 'ledgers_only') {
        setExecutionProgress('Deleting inward stock ledgers...');
        const res = await clearAllStockLedgers();
        setSuccessReport({
          title: 'Inward Stock Ledgers Cleared',
          details: [`Removed ${res.count || stockLedgers.length} stock ledger invoices from Firestore.`]
        });
      } else if (actionToConfirm.type === 'zero_stock_only') {
        setExecutionProgress('Setting all footwear stock counts to 0...');
        for (const prod of products) {
          const zeroedSizeStock: Record<string, number> = {};
          prod.sizes.forEach((s) => {
            zeroedSizeStock[String(s)] = 0;
          });
          const zeroedSizeColorStock: Record<string, Record<string, number>> = {};
          prod.sizes.forEach((s) => {
            zeroedSizeColorStock[String(s)] = { '1': 0, '2': 0, '3': 0 };
          });

          await setDoc(
            doc(db, 'products', prod.id),
            {
              ...prod,
              stock: 0,
              sizeStock: zeroedSizeStock,
              sizeColorStock: zeroedSizeColorStock
            },
            { merge: true }
          );
        }
        setSuccessReport({
          title: 'Product Stock Zeroed',
          details: [`All ${products.length} footwear styles now have 0 stock across all sizes and colors.`]
        });
      } else if (actionToConfirm.type === 'reset_catalog_only') {
        setExecutionProgress('Restoring default initial products...');
        await seedProductsDatabase();
        setSuccessReport({
          title: 'Default Products Restored',
          details: [`Restored ${INITIAL_PRODUCTS.length} initial footwear styles to database.`]
        });
      } else if (actionToConfirm.type === 'wipe_catalog_only') {
        setExecutionProgress('Deleting all products...');
        const res = await clearAllProducts();
        setSuccessReport({
          title: 'Product Catalog Cleared',
          details: [`Removed ${res.count || products.length} products from database.`]
        });
      } else if (actionToConfirm.type === 'demands_only') {
        localStorage.removeItem('prashant_wholesale_demands_list');
        localStorage.removeItem('prashant_wholesale_demands_v1');
        setSuccessReport({
          title: 'Wholesale Demands Cleared',
          details: ['Removed all procurement demand tracking records.']
        });
      } else if (actionToConfirm.type === 'offers_only') {
        localStorage.removeItem('prashant_managed_offers');
        localStorage.setItem('prashant_product_clearance_offers', JSON.stringify([]));
        window.dispatchEvent(new CustomEvent('prashant_clearance_offers_updated', { detail: [] }));
        window.dispatchEvent(new Event('storage'));
        setSuccessReport({
          title: 'Promotional Offers Cleared',
          details: ['Removed all clearance promotions and coupons.']
        });
      }

      if (onRefreshParentState) {
        onRefreshParentState();
      }
    } catch (e: any) {
      console.error('Data management error:', e);
      alert(`Error during data operation: ${e?.message || e}`);
    } finally {
      setIsExecuting(false);
      setIsConfirmModalOpen(false);
    }
  };

  // 1. ACCESS DENIED / ELEVATION VIEW FOR NON-ADMINISTRATIVE ACCOUNTS
  if (!isSuperAdminUser) {
    return (
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto py-8">
        <div className={`p-8 rounded-3xl border text-center relative overflow-hidden shadow-2xl ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-zinc-900'
        }`}>
          {/* Subtle Warning Pattern */}
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 text-rose-500 shadow-lg shadow-rose-500/10">
            <Lock size={32} className="stroke-[2.5px]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/10 border border-rose-500/30 text-rose-500 mb-3">
            <ShieldAlert size={12} />
            <span>Administrative Access Required</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
            Data Management is Restricted
          </h2>

          <p className={`text-xs sm:text-sm max-w-lg mx-auto leading-relaxed mb-6 ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}>
            Only the <strong>Administrative Account (Proprietor & Supervisor)</strong> has permissions to wipe, reset, or purge store transaction ledgers and sample databases. Standard admin staff and billing counter operators are restricted from accessing this panel.
          </p>

          {/* Supervisor PIN Elevation Form */}
          <div className={`max-w-md mx-auto p-5 rounded-2xl border text-left ${
            isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-3 text-amber-500">
              <Key size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Supervisor Authorization</span>
            </div>
            <p className="text-[11px] text-zinc-500 mb-3">
              If you are the store owner/supervisor on duty, enter the Administrative PIN (default: <span className="font-mono font-bold text-amber-500">9999</span>) to unlock temporary data management controls:
            </p>

            <form onSubmit={handleVerifySupervisorPin} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Enter Supervisor PIN (e.g. 9999)"
                  value={supervisorPinInput}
                  onChange={(e) => {
                    setSupervisorPinInput(e.target.value);
                    setPinError(null);
                  }}
                  className={`flex-1 px-3.5 py-2 rounded-xl text-xs font-mono font-bold border outline-none transition-all ${
                    isDark 
                      ? 'bg-zinc-900 border-zinc-700 text-white focus:border-amber-500' 
                      : 'bg-white border-slate-300 text-zinc-900 focus:border-amber-500'
                  }`}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:from-amber-400 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20 shrink-0"
                >
                  Unlock Access
                </button>
              </div>

              {pinError && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                  <AlertTriangle size={12} />
                  <span>{pinError}</span>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHORIZED ADMINISTRATIVE DATA MANAGEMENT VIEW
  return (
    <div id="data-management-section" className="space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-[28px] border transition-all duration-300 relative overflow-hidden ${
        isDark 
          ? 'bg-zinc-900 border-zinc-800 text-white shadow-2xl' 
          : 'bg-white border-zinc-200 text-zinc-900 shadow-xl shadow-slate-100/50'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
                <Database size={20} className="stroke-[2.5px]" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center gap-1.5">
                <ShieldCheck size={12} />
                <span>Administrative Level • Full Access</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Store Data Management & Sample Cleanup
            </h1>
            <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
              Manage live Firestore databases and cached records. Wipe testing & sample transactions, clear previous mock bills, reset inward stock registers, or restore clean state for live production selling.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerActionConfirmation(
                  'master_wipe',
                  'Clear All Sample & Testing Data',
                  'This master wipe permanently deletes test orders, POS invoices, stock ledgers, and testing records across Firestore and local storage, providing a clean slate for real store sales.',
                  'CLEAR ALL DATA'
                );
              }}
              className="px-5 py-3 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95"
            >
              <Trash2 size={16} className="stroke-[2.5px]" />
              <span>Clear All Sample Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Database Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          {
            label: 'Sales Orders / Bills',
            count: orders.length,
            icon: ShoppingCart,
            color: 'emerald',
            unit: 'Invoices'
          },
          {
            label: 'Inward Stock Ledgers',
            count: stockLedgers.length,
            icon: FileText,
            color: 'indigo',
            unit: 'Ledgers'
          },
          {
            label: 'Footwear Catalog',
            count: products.length,
            icon: Package,
            color: 'amber',
            unit: 'Styles'
          },
          {
            label: 'Wholesale Demands',
            count: (() => {
              try {
                const raw = localStorage.getItem('prashant_wholesale_demands_list');
                return raw ? JSON.parse(raw).length : 0;
              } catch (e) {
                return 0;
              }
            })(),
            icon: TrendingUp,
            color: 'purple',
            unit: 'Demands'
          },
          {
            label: 'Clearance & Offers',
            count: (() => {
              try {
                const raw = localStorage.getItem('prashant_managed_offers');
                return raw ? JSON.parse(raw).length : 0;
              } catch (e) {
                return 0;
              }
            })(),
            icon: Sparkles,
            color: 'rose',
            unit: 'Promos'
          },
          {
            label: 'Database Status',
            count: 'Online',
            icon: Database,
            color: 'emerald',
            unit: 'Firestore Live'
          }
        ].map((stat, idx) => {
          const IconComp = stat.icon;
          return (
            <div
              key={idx}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {stat.label}
                </span>
                <IconComp size={14} className={`text-${stat.color}-500`} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono">
                  {stat.count}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">
                  {stat.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {successReport && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-5 rounded-2xl border flex items-start justify-between gap-4 ${
              isDark ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">{successReport.title}</h4>
                <ul className="text-xs space-y-1 mt-1.5 list-disc list-inside text-emerald-600 dark:text-emerald-400 font-medium">
                  {successReport.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSuccessReport(null)}
              className="p-1 text-emerald-500 hover:text-emerald-700 cursor-pointer"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MASTER WIPE SECTION (Primary Feature Requested) */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden ${
        isDark 
          ? 'bg-gradient-to-br from-zinc-900 via-zinc-900 to-rose-950/30 border-rose-900/40' 
          : 'bg-gradient-to-br from-white via-slate-50 to-rose-50/50 border-rose-200 shadow-md shadow-rose-500/5'
      }`}>
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2.5 mb-3 text-rose-500">
          <AlertTriangle size={20} className="stroke-[2.5px]" />
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider">
            Master Data Reset: Clear All Sample Data
          </h2>
        </div>

        <div className={`p-4 rounded-2xl border mb-6 text-xs leading-relaxed flex items-start gap-3 ${
          isDark ? 'bg-rose-950/30 border-rose-800/50 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <Info size={18} className="shrink-0 mt-0.5 text-rose-500" />
          <div>
            <strong className="block font-bold mb-1">
              ⚠️ HIGH IMPACT OPERATION — Clear All Test Data for Real Selling:
            </strong>
            This tool wipes simulated testing orders, testing receipts, and demo transactions so you can start clean recording real customer footwear sales and stock intakes. Choose what to purge below:
          </div>
        </div>

        {/* Checkboxes for Master Reset */}
        <div className="space-y-4 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            1. Select Data Collections to Wipe:
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                id: 'orders',
                label: 'Sales Orders & POS Bills',
                desc: `Permanently delete all ${orders.length} order invoices & today's summary`,
                checked: clearOrdersOption,
                onChange: setClearOrdersOption
              },
              {
                id: 'ledgers',
                label: 'Inward Stock Ledgers',
                desc: `Permanently delete all ${stockLedgers.length} stock inward supplier receipts`,
                checked: clearStockLedgersOption,
                onChange: setClearStockLedgersOption
              },
              {
                id: 'demands',
                label: 'Wholesale Demands',
                desc: 'Clear procurement demands and purchase orders tracker',
                checked: clearWholesaleDemandsOption,
                onChange: setClearWholesaleDemandsOption
              },
              {
                id: 'offers',
                label: 'Promos & Offers',
                desc: 'Clear discount coupons, promotional banners & clearance deals',
                checked: clearOffersOption,
                onChange: setClearOffersOption
              },
              {
                id: 'caches',
                label: 'Local Caches & Audit Logs',
                desc: 'Flush offline browser storage and audit logs history',
                checked: clearCachesOption,
                onChange: setClearCachesOption
              }
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  opt.checked
                    ? (isDark ? 'bg-rose-950/20 border-rose-500/50 text-white' : 'bg-rose-50/70 border-rose-300 text-zinc-900')
                    : (isDark ? 'bg-zinc-950/40 border-zinc-800 text-zinc-400 opacity-60' : 'bg-white border-slate-200 text-zinc-500 opacity-60')
                }`}
              >
                <input
                  type="checkbox"
                  checked={opt.checked}
                  onChange={(e) => opt.onChange(e.target.checked)}
                  className="mt-1 accent-rose-500 w-4 h-4 rounded"
                />
                <div>
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[11px] text-zinc-500 leading-tight block mt-0.5">
                    {opt.desc}
                  </span>
                </div>
              </label>
            ))}
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mt-6">
            2. Choose Product Catalog Handling:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'zero_stock',
                title: 'Keep Products, Zero Stock (Recommended)',
                badge: 'Recommended',
                desc: 'Keep all footwear images and styles, but set stock of every size/color to 0 pairs, ready for real supplier inward stock addition.'
              },
              {
                id: 'reset_sample',
                title: 'Restore Default Initial Sample Catalog',
                badge: 'Sample Data',
                desc: 'Reset all products back to standard Walkaroo, Sparx, Campus, Indus, Paragon sample styles with prefilled stock.'
              },
              {
                id: 'wipe_empty',
                title: 'Wipe All Products Completely',
                badge: 'Empty Catalog',
                desc: 'Delete every product in Firestore database so catalog is 100% blank to create your custom footwear models from scratch.'
              }
            ].map((mode) => (
              <label
                key={mode.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-2 cursor-pointer transition-all ${
                  catalogHandlingMode === mode.id
                    ? (isDark ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm' : 'bg-amber-50 border-amber-400 text-zinc-900 shadow-sm')
                    : (isDark ? 'bg-zinc-950/40 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-zinc-600')
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="catalogHandling"
                      checked={catalogHandlingMode === mode.id}
                      onChange={() => setCatalogHandlingMode(mode.id as any)}
                      className="accent-amber-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold">{mode.title}</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 leading-snug pl-6">
                  {mode.desc}
                </p>
              </label>
            ))}
          </div>
        </div>

        {/* Master Trigger Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-xs text-zinc-500 flex items-center gap-2">
            <Lock size={14} className="text-amber-500" />
            <span>Requires administrative confirmation phrase before execution.</span>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerActionConfirmation(
                'master_wipe',
                'Confirm Master Sample Data Wipe',
                'This will delete all selected sample data from Firestore. This action is permanent and cannot be undone.',
                'CLEAR ALL DATA'
              );
            }}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 active:scale-95"
          >
            <Trash2 size={16} className="stroke-[2.5px]" />
            <span>Wipe All Selected Sample Data</span>
          </button>
        </div>
      </div>

      {/* GRANULAR SINGLE-CLICK CLEANERS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">
            Granular Database Cleaners (Individual Operations)
          </h3>
          <span className="text-xs text-zinc-500">Perform selective cleans without wiping the full app</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. Clear Only Orders */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <ShoppingCart size={18} />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {orders.length} in DB
                </span>
              </div>
              <h4 className="text-sm font-black">Clear Only Sales & POS Invoices</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Deletes all completed sales bills, refunds, and today's summary sales figures while preserving stock and products.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerActionConfirmation(
                  'orders_only',
                  'Clear All Sales Orders',
                  `Are you sure you want to permanently delete all ${orders.length} sales orders and invoices from Firestore?`,
                  'CLEAR ORDERS'
                );
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Clear Orders Only</span>
            </button>
          </div>

          {/* 2. Clear Only Stock Ledgers */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {stockLedgers.length} in DB
                </span>
              </div>
              <h4 className="text-sm font-black">Clear Inward Stock Ledgers</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Deletes all supplier inward goods receipts and inward ledger entries from the stock history log.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerActionConfirmation(
                  'ledgers_only',
                  'Clear Inward Stock Ledgers',
                  `Are you sure you want to permanently delete all ${stockLedgers.length} inward stock ledger invoices from Firestore?`,
                  'CLEAR LEDGERS'
                );
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-indigo-500/30 text-indigo-500 hover:bg-indigo-500 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Clear Ledgers Only</span>
            </button>
          </div>

          {/* 3. Reset Product Stock to Zero */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Layers size={18} />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {products.length} Styles
                </span>
              </div>
              <h4 className="text-sm font-black">Reset Product Stock to Zero</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Sets the quantity of all footwear sizes & colors to 0 pairs without deleting the product listings or photographs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerActionConfirmation(
                  'zero_stock_only',
                  'Zero All Product Stock',
                  `This will set inventory stock to 0 for all ${products.length} footwear styles in your catalog.`,
                  'ZERO STOCK'
                );
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Reset Stock to 0</span>
            </button>
          </div>

          {/* 4. Restore Default Sample Catalog */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <RefreshCw size={18} />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {INITIAL_PRODUCTS.length} Styles
                </span>
              </div>
              <h4 className="text-sm font-black">Restore Default Sample Catalog</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Re-seeds the standard sample footwear styles (Walkaroo, Sparx, Campus, Indus, Paragon) with prefilled stock.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerActionConfirmation(
                  'reset_catalog_only',
                  'Restore Default Sample Products',
                  `Re-seed ${INITIAL_PRODUCTS.length} standard footwear products with default initial stocks?`,
                  'RESTORE CATALOG'
                );
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={14} />
              <span>Restore Default Catalog</span>
            </button>
          </div>

          {/* 5. Clear Demands Tracker */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <TrendingUp size={18} />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  Demands
                </span>
              </div>
              <h4 className="text-sm font-black">Clear Wholesale Demands</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Purges the wholesale stock procurement demand requests tracker and historical demand lists.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerActionConfirmation(
                  'demands_only',
                  'Clear Wholesale Demands',
                  'Remove all wholesale procurement demand tracking records?',
                  'CLEAR DEMANDS'
                );
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-purple-500/30 text-purple-500 hover:bg-purple-500 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Clear Demands Only</span>
            </button>
          </div>

          {/* 6. Wipe Entire Product Catalog */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Package size={18} />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-500">
                  Danger
                </span>
              </div>
              <h4 className="text-sm font-black">Wipe Catalog (Empty Store)</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Completely deletes every single product in Firestore so your catalog starts from 0 styles.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerActionConfirmation(
                  'wipe_catalog_only',
                  'Wipe Entire Product Catalog',
                  `Are you sure you want to completely delete all ${products.length} footwear products from Firestore? The catalog will be empty.`,
                  'WIPE CATALOG'
                );
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Delete All Products</span>
            </button>
          </div>

        </div>
      </div>

      {/* CONFIRMATION & VERIFICATION MODAL */}
      <AnimatePresence>
        {isConfirmModalOpen && actionToConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isExecuting && setIsConfirmModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`relative w-full max-w-lg rounded-3xl border p-6 sm:p-7 shadow-2xl z-10 ${
                isDark ? 'bg-zinc-950 border-rose-900/60 text-white' : 'bg-white border-rose-200 text-zinc-900'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} className="stroke-[2.5px]" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 block mb-0.5">
                    Administrative Security Verification
                  </span>
                  <h3 className="text-lg font-black">{actionToConfirm.title}</h3>
                </div>
                <button
                  type="button"
                  disabled={isExecuting}
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 mb-5">
                {actionToConfirm.description}
              </p>

              {/* Phrase Confirmation Input */}
              <div className={`p-4 rounded-2xl border mb-5 space-y-2 ${
                isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <label className="text-[11px] font-bold block text-zinc-400">
                  To confirm, please type <span className="font-mono font-black text-rose-500">"{actionToConfirm.requiredPhrase}"</span> below:
                </label>
                <input
                  type="text"
                  placeholder={`Type "${actionToConfirm.requiredPhrase}" or "9999"`}
                  value={confirmationPhraseInput}
                  disabled={isExecuting}
                  onChange={(e) => setConfirmationPhraseInput(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono font-bold border outline-none ${
                    isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300 text-zinc-900'
                  }`}
                />
              </div>

              {/* Execution Progress */}
              {isExecuting && (
                <div className="mb-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-amber-500 font-bold">
                    <span>{executionProgress}</span>
                    <RefreshCw size={12} className="animate-spin" />
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isExecuting}
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    isExecuting || 
                    (confirmationPhraseInput.trim().toUpperCase() !== actionToConfirm.requiredPhrase && 
                     confirmationPhraseInput.trim() !== '9999' &&
                     confirmationPhraseInput.trim() !== 'Prashant')
                  }
                  onClick={handleExecuteConfirmedAction}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-2 shadow-lg shadow-rose-600/30"
                >
                  <Trash2 size={14} className="stroke-[2.5px]" />
                  <span>Execute Permanent Reset</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
