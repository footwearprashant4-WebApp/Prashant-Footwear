import React, { useMemo } from 'react';
import { Order, Product } from '../types';

interface AdminMobileHomeViewProps {
  isDark: boolean;
  orders: Order[];
  products: Product[];
  onNavigate: (tabId: string) => void;
  onExitAdmin?: () => void;
  onToggleTheme?: () => void;
  onOpenMenu?: () => void;
}

export const AdminMobileHomeView: React.FC<AdminMobileHomeViewProps> = ({
  isDark,
  orders,
  products: _products,
  onNavigate
}) => {
  // Date formatting matching reference image: "Today's Summary, Sep 19"
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayShortDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  // Filter orders made today
  const todayOrders = useMemo(() => {
    return (orders || []).filter(o => o.createdAt && o.createdAt.startsWith(todayStr));
  }, [orders, todayStr]);

  // Today's gross turnover
  const todayGrossSales = useMemo(() => {
    return todayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [todayOrders]);

  // Tactile Golden 3D Squircle styling matching the reference image
  const goldenSquircleStyle: React.CSSProperties = {
    background: 'radial-gradient(120% 120% at 28% 22%, #FFF4D2 0%, #F5DE98 22%, #D4A853 50%, #B68528 78%, #785210 100%)',
    boxShadow: '0 8px 18px -2px rgba(140, 95, 20, 0.38), inset 0 2px 3.5px rgba(255, 255, 255, 0.85), inset 0 -2.5px 4px rgba(0, 0, 0, 0.28)'
  };

  return (
    <div className="w-full max-w-[480px] sm:max-w-[520px] mx-auto pb-16 px-4 sm:px-6">
      
      {/* 1. Today's Summary Card (Exact Match to Reference Image) */}
      <div 
        onClick={() => onNavigate('today-summary')}
        className={`w-full rounded-[30px] sm:rounded-[34px] p-5 sm:p-6 border-[1.5px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between gap-4 ${
          isDark 
            ? 'bg-zinc-900 border-zinc-700' 
            : 'bg-white border-black'
        }`}
      >
        <div className="min-w-0 flex-1">
          <span className="text-[13px] sm:text-[14px] font-medium font-sans text-zinc-500 dark:text-zinc-400 block leading-tight">
            Today's Summary, {todayShortDate}
          </span>
          <div className="text-[34px] sm:text-[40px] font-black font-display tracking-tight text-zinc-950 dark:text-white leading-none mt-2.5 tabular-nums">
            ₹{todayGrossSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Golden 3D Squircle with Upward Trend Arrow */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('today-summary');
          }}
          style={goldenSquircleStyle}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[22px] flex items-center justify-center text-zinc-950 active:scale-95 hover:scale-105 transition-transform cursor-pointer shrink-0"
          title="View Today's Summary Performance"
        >
          {/* Trend Line Arrow SVG Matching Reference Image */}
          <svg 
            viewBox="0 0 24 24" 
            className="w-7 h-7 sm:w-8 sm:h-8 text-black" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </button>
      </div>

      {/* 2. Section Title: WORKSPACE SECTIONS */}
      <div className="pt-7 pb-3.5 px-1">
        <h2 className="font-black text-xs sm:text-[13px] tracking-[0.25em] uppercase font-display text-zinc-950 dark:text-white">
          WORKSPACE SECTIONS
        </h2>
      </div>

      {/* 3. Workspace Section Cards (Exact Match to Reference Image + 2 Requested Buttons) */}
      <div className="space-y-3.5 sm:space-y-4">
        
        {/* Button 1: Make Bill (Billing) */}
        <button
          type="button"
          id="btn-admin-make-bill"
          onClick={() => onNavigate('billing')}
          className={`w-full rounded-[28px] sm:rounded-[32px] p-4 sm:p-4.5 border-[1.5px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center gap-4 text-left active:scale-[0.985] transition-all cursor-pointer ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-500' 
              : 'bg-white border-black hover:border-zinc-800'
          }`}
        >
          <div 
            style={goldenSquircleStyle}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[22px] flex items-center justify-center shrink-0 text-black"
          >
            {/* Bill Voucher Ticket with Perforated Scalloped Edge and Currency Symbol */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-7 h-7 sm:w-8 sm:h-8 text-black" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2.5a2.5 2.5 0 0 0 0 5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2.5a2.5 2.5 0 0 0 0-5V6Z" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <path d="M14.5 10.5a2 2 0 0 0-2-1.5h-1a1.5 1.5 0 0 0 0 3h2a1.5 1.5 0 0 1 0 3h-1a2 2 0 0 1-2-1.5" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] sm:text-[19px] font-black font-display tracking-tight text-zinc-950 dark:text-white leading-tight">
              Make Bill
            </h3>
            <p className="text-[13px] sm:text-[13.5px] mt-1 font-medium font-sans text-zinc-500 dark:text-zinc-400 leading-none">
              (Billing)
            </p>
          </div>
        </button>

        {/* Button 2: Products Stock (Manage Products) */}
        <button
          type="button"
          id="btn-admin-products-stock"
          onClick={() => onNavigate('stock')}
          className={`w-full rounded-[28px] sm:rounded-[32px] p-4 sm:p-4.5 border-[1.5px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center gap-4 text-left active:scale-[0.985] transition-all cursor-pointer ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-500' 
              : 'bg-white border-black hover:border-zinc-800'
          }`}
        >
          <div 
            style={goldenSquircleStyle}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[22px] flex items-center justify-center shrink-0 text-black"
          >
            {/* 3D Isometric Box */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-7 h-7 sm:w-8 sm:h-8 text-black" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m16.5 9.4-9-5.16a1.8 1.8 0 0 0-1.8 0L3 5.8a1.8 1.8 0 0 0-.9 1.56v7.28a1.8 1.8 0 0 0 .9 1.56l2.75 1.56a1.8 1.8 0 0 0 1.8 0l8.95-5.16a1.8 1.8 0 0 0 .9-1.56V7.84a1.8 1.8 0 0 0-.9-1.56l-2.75-1.56a1.8 1.8 0 0 0-1.8 0z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] sm:text-[19px] font-black font-display tracking-tight text-zinc-950 dark:text-white leading-tight">
              Products Stock
            </h3>
            <p className="text-[13px] sm:text-[13.5px] mt-1 font-medium font-sans text-zinc-500 dark:text-zinc-400 leading-none">
              Manage Products
            </p>
          </div>
        </button>

        {/* Button 3: Order Stock Management (Wholesaler Demand Articles) */}
        <button
          type="button"
          id="btn-admin-order-stock"
          onClick={() => onNavigate('wholesale_demand')}
          className={`w-full rounded-[28px] sm:rounded-[32px] p-4 sm:p-4.5 border-[1.5px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center gap-4 text-left active:scale-[0.985] transition-all cursor-pointer ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-500' 
              : 'bg-white border-black hover:border-zinc-800'
          }`}
        >
          <div 
            style={goldenSquircleStyle}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[22px] flex items-center justify-center shrink-0 text-black"
          >
            {/* Delivery Van / Truck */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-7 h-7 sm:w-8 sm:h-8 text-black" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
              <path d="M15 18h2a1 1 0 0 0 1-1v-3.5a1.5 1.5 0 0 0-.44-1.06L14.7 9.56A1.5 1.5 0 0 0 13.64 9H14" />
              <circle cx="7" cy="18.5" r="2.2" fill="#141311" stroke="none" />
              <circle cx="17" cy="18.5" r="2.2" fill="#141311" stroke="none" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] sm:text-[19px] font-black font-display tracking-tight text-zinc-950 dark:text-white leading-tight">
              Purchase Orders
            </h3>
            <p className="text-[13px] sm:text-[13.5px] mt-1 font-medium font-sans text-zinc-500 dark:text-zinc-400 leading-none">
              Wholesaler Demand Articles
            </p>
          </div>
        </button>

        {/* Button 4: Sales Report (Manage Reports) */}
        <button
          type="button"
          id="btn-admin-sales-report"
          onClick={() => onNavigate('reports')}
          className={`w-full rounded-[28px] sm:rounded-[32px] p-4 sm:p-4.5 border-[1.5px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center gap-4 text-left active:scale-[0.985] transition-all cursor-pointer ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-500' 
              : 'bg-white border-black hover:border-zinc-800'
          }`}
        >
          <div 
            style={goldenSquircleStyle}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[22px] flex items-center justify-center shrink-0 text-black"
          >
            {/* 3 Rounded Vertical Bars */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-7 h-7 sm:w-8 sm:h-8 text-black" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="7" y1="20" x2="7" y2="14" />
              <line x1="12" y1="20" x2="12" y2="7" />
              <line x1="17" y1="20" x2="17" y2="11" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] sm:text-[19px] font-black font-display tracking-tight text-zinc-950 dark:text-white leading-tight">
              Sales Report
            </h3>
            <p className="text-[13px] sm:text-[13.5px] mt-1 font-medium font-sans text-zinc-500 dark:text-zinc-400 leading-none">
              Manage Reports
            </p>
          </div>
        </button>

        {/* Button 5 (Requested): Add New Product (Manage Product) */}
        <button
          type="button"
          id="btn-admin-add-new-product"
          onClick={() => onNavigate('catalogue_add')}
          className={`w-full rounded-[28px] sm:rounded-[32px] p-4 sm:p-4.5 border-[1.5px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center gap-4 text-left active:scale-[0.985] transition-all cursor-pointer ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-500' 
              : 'bg-white border-black hover:border-zinc-800'
          }`}
        >
          <div 
            style={goldenSquircleStyle}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[22px] flex items-center justify-center shrink-0 text-black"
          >
            {/* Bold Plus Symbol */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-7 h-7 sm:w-8 sm:h-8 text-black" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] sm:text-[19px] font-black font-display tracking-tight text-zinc-950 dark:text-white leading-tight">
              Add New Product
            </h3>
            <p className="text-[13px] sm:text-[13.5px] mt-1 font-medium font-sans text-zinc-500 dark:text-zinc-400 leading-none">
              Manage Product
            </p>
          </div>
        </button>

        {/* Button 6 (Requested): Reports and Analytical (Analytical & Business Reports) */}
        <button
          type="button"
          id="btn-admin-reports-analytics"
          onClick={() => onNavigate('reports')}
          className={`w-full rounded-[28px] sm:rounded-[32px] p-4 sm:p-4.5 border-[1.5px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center gap-4 text-left active:scale-[0.985] transition-all cursor-pointer ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-500' 
              : 'bg-white border-black hover:border-zinc-800'
          }`}
        >
          <div 
            style={goldenSquircleStyle}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[22px] flex items-center justify-center shrink-0 text-black"
          >
            {/* Analytics Trends & Bars */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-7 h-7 sm:w-8 sm:h-8 text-black" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="12" y1="20" x2="12" y2="4" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="6" y1="20" x2="6" y2="14" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M3 21h18" strokeWidth="2.2" strokeLinecap="round" />
              <path d="m4 12 5-5 4 4 7-7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] sm:text-[19px] font-black font-display tracking-tight text-zinc-950 dark:text-white leading-tight">
              Reports and Analytical
            </h3>
            <p className="text-[13px] sm:text-[13.5px] mt-1 font-medium font-sans text-zinc-500 dark:text-zinc-400 leading-none">
              Analytical & Business Reports
            </p>
          </div>
        </button>

      </div>
    </div>
  );
};
