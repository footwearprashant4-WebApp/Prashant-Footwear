import React, { useState, useMemo, useRef } from 'react';
import { 
  Calendar, FileText, Download, Printer, TrendingUp, Package, 
  ArrowUpRight, ArrowDownRight, Layers, Award, Tag, IndianRupee,
  RotateCcw, CheckCircle2, ChevronRight, BarChart2, Filter,
  Share2, Copy, Check, Users, Sparkles, AlertTriangle, Clock,
  CreditCard, Smartphone, ShoppingBag, Eye, RefreshCw, FileSpreadsheet
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, Order, StockLedger } from '../types';

interface MonthlyReportSectionProps {
  isDark: boolean;
  orders: Order[];
  products: Product[];
  stockLedgers?: StockLedger[];
  orderInvoices?: any[];
  onBackToHome?: () => void;
}

export const MonthlyReportSection: React.FC<MonthlyReportSectionProps> = ({
  isDark,
  orders = [],
  products = [],
  stockLedgers = [],
  orderInvoices = [],
  onBackToHome
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-based: 0 = Jan, 11 = Dec
  const [copySuccess, setCopySuccess] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const printableReportRef = useRef<HTMLDivElement>(null);

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthShortNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Year options
  const availableYears = useMemo(() => {
    const years: number[] = [];
    const minYear = 2024;
    const maxYear = Math.max(currentDate.getFullYear() + 1, 2027);
    for (let y = minYear; y <= maxYear; y++) {
      years.push(y);
    }
    return years;
  }, [currentDate]);

  const [filterMode, setFilterMode] = useState<'monthly' | 'custom_range'>('monthly');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Selected Month Date Range Details or Custom Range Details
  const monthDateRange = useMemo(() => {
    if (filterMode === 'monthly') {
      const start = new Date(selectedYear, selectedMonth, 1, 0, 0, 0, 0);
      const end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
      const totalDays = end.getDate();
      return {
        start,
        end,
        totalDays,
        formattedStart: start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        formattedEnd: end.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        shortRange: `01–${totalDays} ${monthShortNames[selectedMonth]} ${selectedYear}`,
        title: `${monthNames[selectedMonth]} ${selectedYear}`,
        monthYearShort: `${monthShortNames[selectedMonth]} ${selectedYear}`
      };
    } else {
      const start = new Date(`${startDate}T00:00:00.000Z`);
      const end = new Date(`${endDate}T23:59:59.999Z`);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
      return {
        start,
        end,
        totalDays: diffDays,
        formattedStart: start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        formattedEnd: end.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        shortRange: `${startDate} to ${endDate}`,
        title: `Custom Range (${startDate} to ${endDate})`,
        monthYearShort: `${startDate} - ${endDate}`
      };
    }
  }, [selectedYear, selectedMonth, filterMode, startDate, endDate]);

  // Helper to check if a date string falls inside the selected range
  const isDateInFilterRange = (dateStr?: string | number | Date | null) => {
    if (!dateStr) return false;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      if (filterMode === 'monthly') {
        return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
      } else {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        const end = new Date(`${endDate}T23:59:59.999Z`);
        return d >= start && d <= end;
      }
    } catch {
      return false;
    }
  };

  // Helper to check if an order is a return/refund
  const getIsOrderReturnOrRefund = (order: Order) => {
    if (!order) return false;
    const id = String(order.id || '').toUpperCase();
    const pm = String(order.paymentMethod || '').toUpperCase();
    return (
      id.startsWith('RF-') ||
      id.startsWith('RET-') ||
      id.startsWith('REFUND-') ||
      id.startsWith('EXC-') ||
      pm.includes('REFUND') ||
      pm.includes('RETURN') ||
      (order.totalAmount !== undefined && order.totalAmount < 0)
    );
  };

  const [reportDataSource, setReportDataSource] = useState<'auto' | 'real' | 'sample'>('auto');

  // --- SAMPLE STORE ORDERS GENERATOR (Used when real month orders = 0 or in Demo Mode) ---
  const generateSampleOrders = useMemo(() => {
    return (year: number, month: number): Order[] => {
      const monthStr = String(month + 1).padStart(2, '0');
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const sampleList: Order[] = [];
      const sampleNames = [
        'Suresh Kumar', 'Rajesh Sharma', 'Amit Patel', 'Pooja Verma', 
        'Vikram Singh', 'Deepak Joshi', 'Anita Rani', 'Ramesh Chand', 
        'Kavita Gupta', 'Sunil Yadav', 'Manoj Kumar', 'Sanjay Mehta',
        'Priya Sharma', 'Anil Verma', 'Sunita Devi', 'Vijay Malviya'
      ];
      const paymentMethods = ['UPI / Online', 'UPI / Online', 'Cash', 'Cash', 'Card / Pay Later'];
      const storeProds = (products && products.length > 0) ? products : [];
      
      for (let d = 1; d <= Math.min(daysInMonth, 28); d += 2) {
        const dayStr = String(d).padStart(2, '0');
        const orderId = `INV-${year}${monthStr}${dayStr}-${100 + d}`;
        const custName = sampleNames[d % sampleNames.length];
        const pm = paymentMethods[d % paymentMethods.length];
        
        const p1 = storeProds[(d * 3) % Math.max(1, storeProds.length)] || {
          id: 'walkaroo-sample-1',
          name: 'Walkaroo Men Slip-On Slipper',
          brand: 'Walkaroo',
          category: 'Men',
          price: 499
        };
        const p2 = storeProds[(d * 5 + 1) % Math.max(1, storeProds.length)] || {
          id: 'walkmate-sample-2',
          name: 'Walkmate Women Office Sandal',
          brand: 'Walkmate',
          category: 'Women',
          price: 399
        };
        
        const qty1 = (d % 3) + 1;
        const qty2 = (d % 2) + 1;
        const price1 = Number(p1.price) || 499;
        const price2 = Number(p2.price) || 399;
        const total = price1 * qty1 + price2 * qty2;
        
        sampleList.push({
          id: orderId,
          customerName: custName,
          customerMobile: `98765${10000 + d * 33}`,
          paymentMethod: pm,
          totalAmount: total,
          status: 'completed',
          createdAt: `${year}-${monthStr}-${dayStr}T14:${(d * 7) % 60}:00.000Z`,
          items: [
            {
              productId: p1.id,
              name: p1.name,
              category: p1.category || 'Men',
              subCategory: (p1 as any).subCategory || (p1.category === 'Men' ? 'Men Office Wear' : p1.category === 'Women' ? 'Women Sandals' : 'Kids Sports & Casual'),
              price: price1,
              quantity: qty1,
              size: 7 + (d % 4)
            },
            {
              productId: p2.id,
              name: p2.name,
              category: p2.category || 'Women',
              subCategory: (p2 as any).subCategory || (p2.category === 'Men' ? 'Men Sandals' : p2.category === 'Women' ? 'Women Office Wear' : 'Kids School Shoes'),
              price: price2,
              quantity: qty2,
              size: 8 - (d % 3)
            }
          ]
        });
      }
      return sampleList;
    };
  }, [products]);

  // --- DATA AGGREGATION FOR SELECTED MONTH ---
  const monthlyData = useMemo(() => {
    // 1. Filter Real Orders in the range
    const realMonthOrders = (orders || []).filter(o => isDateInFilterRange(o.createdAt));
    
    let monthOrders: Order[] = [];
    let isSampleData = false;

    if (reportDataSource === 'sample') {
      monthOrders = generateSampleOrders(selectedYear, selectedMonth);
      isSampleData = true;
    } else if (reportDataSource === 'real') {
      monthOrders = realMonthOrders;
      isSampleData = false;
    } else {
      // Auto mode: If real month orders exist, use real orders; otherwise generate sample orders
      if (realMonthOrders.length > 0) {
        monthOrders = realMonthOrders;
        isSampleData = false;
      } else {
        monthOrders = generateSampleOrders(selectedYear, selectedMonth);
        isSampleData = true;
      }
    }
    
    // Separate standard sales vs refunds/returns
    const standardSalesOrders = monthOrders.filter(o => !getIsOrderReturnOrRefund(o));
    const returnRefundOrders = monthOrders.filter(getIsOrderReturnOrRefund);

    // Sales Revenue calculations
    let grossSalesRevenue = 0;
    let totalPairsSold = 0;
    const paymentModeMap: Record<string, { count: number; amount: number }> = {
      'UPI / Online': { count: 0, amount: 0 },
      'Cash': { count: 0, amount: 0 },
      'Card / Pay Later': { count: 0, amount: 0 }
    };

    // Category and Subcategory maps
    const categorySubCategoryMap: Record<string, {
      category: string;
      subCategory: string;
      units: number;
      revenue: number;
    }> = {};

    const brandSalesMap: Record<string, { units: number; revenue: number }> = {};
    const productSalesMap: Record<string, {
      id: string;
      name: string;
      brand: string;
      category: string;
      subCategory: string;
      units: number;
      revenue: number;
      sizes: Record<string, number>;
    }> = {};

    standardSalesOrders.forEach(order => {
      const orderTotal = Number(order.totalAmount) || 0;
      grossSalesRevenue += orderTotal;

      // Payment method normalization
      const pmRaw = (order.paymentMethod || 'Cash').toLowerCase();
      let pmKey = 'Cash';
      if (pmRaw.includes('upi') || pmRaw.includes('gpay') || pmRaw.includes('phonepe') || pmRaw.includes('paytm') || pmRaw.includes('qr') || pmRaw.includes('online')) {
        pmKey = 'UPI / Online';
      } else if (pmRaw.includes('card') || pmRaw.includes('pos') || pmRaw.includes('later') || pmRaw.includes('credit') || pmRaw.includes('udhar')) {
        pmKey = 'Card / Pay Later';
      } else {
        pmKey = 'Cash';
      }

      if (!paymentModeMap[pmKey]) {
        paymentModeMap[pmKey] = { count: 0, amount: 0 };
      }
      paymentModeMap[pmKey].count += 1;
      paymentModeMap[pmKey].amount += orderTotal;

      // Item level aggregation
      (order.items || []).forEach(item => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const itemRevenue = price * qty;
        totalPairsSold += qty;

        // Category & SubCategory
        const cat = item.category || 'Men';
        const subCat = item.subCategory || (cat === 'Men' ? 'Men Office Wear' : cat === 'Women' ? 'Women Sandals' : 'Kids Sports & Casual');
        const catKey = `${cat}___${subCat}`;
        
        if (!categorySubCategoryMap[catKey]) {
          categorySubCategoryMap[catKey] = {
            category: cat,
            subCategory: subCat,
            units: 0,
            revenue: 0
          };
        }
        categorySubCategoryMap[catKey].units += qty;
        categorySubCategoryMap[catKey].revenue += itemRevenue;

        // Brand matching
        const prod = products.find(p => p.id === item.productId);
        const brand = prod?.brand || (item as any).brand || 'Walkaroo';
        if (!brandSalesMap[brand]) brandSalesMap[brand] = { units: 0, revenue: 0 };
        brandSalesMap[brand].units += qty;
        brandSalesMap[brand].revenue += itemRevenue;

        const prodKey = item.productId || item.name;
        if (!productSalesMap[prodKey]) {
          productSalesMap[prodKey] = {
            id: prodKey,
            name: item.name || 'Footwear Article',
            brand,
            category: cat,
            subCategory: subCat,
            units: 0,
            revenue: 0,
            sizes: {}
          };
        }
        productSalesMap[prodKey].units += qty;
        productSalesMap[prodKey].revenue += itemRevenue;

        // Size breakdown
        const sizeNum = item.size ? String(item.size).replace(/^UK\s*/i, '') : '7';
        const sizeKey = `UK ${sizeNum}`;
        productSalesMap[prodKey].sizes[sizeKey] = (productSalesMap[prodKey].sizes[sizeKey] || 0) + qty;
      });
    });

    // Refunds and Returns calculations
    let totalRefundAmount = 0;
    let totalReturnedPairs = 0;
    returnRefundOrders.forEach(o => {
      const amt = Math.abs(Number(o.totalAmount) || 0);
      totalRefundAmount += amt;
      (o.items || []).forEach(it => {
        totalReturnedPairs += (Number(it.quantity) || 1);
      });
    });

    // 2. Added Stock / Inventory Inwards in the range
    const monthLedgers = (stockLedgers || []).filter(sl => isDateInFilterRange(sl.createdAt));
    let totalInwardPairsFromLedgers = 0;
    monthLedgers.forEach(sl => {
      const units = Number(sl.totalUnits) || (sl.items || []).reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
      totalInwardPairsFromLedgers += units;
    });

    const monthInvoices = (orderInvoices || []).filter(inv => 
      isDateInFilterRange(inv.createdAt) || isDateInFilterRange(inv.invoiceDate || inv.date)
    );
    let totalInwardPairsFromInvoices = 0;
    monthInvoices.forEach(inv => {
      totalInwardPairsFromInvoices += (Number(inv.totalPairs) || Number(inv.totalUnits) || 0);
    });

    const totalStockAddedPairs = Math.max(totalInwardPairsFromLedgers, totalInwardPairsFromInvoices) || totalInwardPairsFromLedgers;
    const netInventoryGrowth = totalStockAddedPairs - totalPairsSold;

    // Categories array
    const categoryPerformanceList = Object.values(categorySubCategoryMap)
      .map(item => ({
        ...item,
        share: grossSalesRevenue > 0 ? (item.revenue / grossSalesRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Brand list
    const brandList = Object.entries(brandSalesMap)
      .map(([brand, data]) => ({
        brand,
        pairs: data.units,
        revenue: data.revenue,
        share: grossSalesRevenue > 0 ? Math.round((data.revenue / grossSalesRevenue) * 100) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Payment channel list
    const paymentChannels = Object.entries(paymentModeMap)
      .map(([channel, data]) => ({
        channel,
        txns: data.count,
        amount: data.amount,
        share: grossSalesRevenue > 0 ? (data.amount / grossSalesRevenue) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Top Selling Articles
    const topArticles = Object.values(productSalesMap)
      .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
      .slice(0, 10);

    // Generate Dynamic Executive Takeaways text
    const topBrand = brandList[0] || { brand: 'Walkaroo', share: 0 };
    const topCat = categoryPerformanceList[0] || { category: 'Men', subCategory: 'Office Wear', share: 0 };
    const secondCat = categoryPerformanceList[1];
    
    let takeawaysText = '';
    if (grossSalesRevenue > 0) {
      takeawaysText = `Key Executive Takeaways: ${topBrand.brand} accounts for ${topBrand.share}% of total revenue and remains the core volume driver. ${topCat.category}'s footwear contributed ${topCat.share.toFixed(0)}% of monthly revenue${secondCat ? `, followed closely by ${secondCat.category}'s ${secondCat.subCategory.toLowerCase()} (${secondCat.share.toFixed(0)}%)` : ''}. Payment intake is ${paymentChannels[0]?.channel || 'UPI'} at ${paymentChannels[0]?.share.toFixed(0) || 50}% and ${paymentChannels[1]?.channel || 'Cash'} at ${paymentChannels[1]?.share.toFixed(0) || 50}%. Total net inventory grew by ${netInventoryGrowth >= 0 ? `+${netInventoryGrowth}` : netInventoryGrowth} pairs over the audit cycle.`;
    } else {
      takeawaysText = `Key Executive Takeaways: No sales orders or stock transactions have been logged yet for ${monthNames[selectedMonth]} ${selectedYear}. Complete sales invoices at the Billing Desk to generate dynamic audit reports.`;
    }

    return {
      grossSalesRevenue,
      totalPairsSold,
      completedInvoicesCount: standardSalesOrders.length,
      totalStockAddedPairs,
      netInventoryGrowth,
      totalRefundAmount,
      returnOrdersCount: returnRefundOrders.length,
      totalReturnedPairs,
      categoryPerformanceList,
      brandList,
      paymentChannels,
      topArticles,
      takeawaysText,
      isSampleData,
      realCount: realMonthOrders.length
    };
  }, [orders, products, stockLedgers, orderInvoices, selectedYear, selectedMonth, reportDataSource, generateSampleOrders]);

  // --- PDF GENERATOR MATCHING THE PROVIDED REPORT LAYOUT EXACTLY ---
  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let currentY = 12;

      // 1. TOP HEADER BANNER (Dark Navy Card `#0F172A`)
      doc.setFillColor(15, 23, 42); // #0F172A Deep Navy
      doc.roundedRect(margin, currentY, contentWidth, 22, 3, 3, 'F');

      // Left: Store Brand & Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('PRASHANT FOOTWEAR', margin + 6, currentY + 9);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // #94A3B8 slate-400
      doc.text('Old Kupwad Road, Lovely Circle, Sangli  •  Tel: +91 95112 44447', margin + 6, currentY + 16);

      // Right: Report Type & Month
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(56, 189, 248); // #38BDF8 Sky Blue
      doc.text('EXECUTIVE SALES REPORT', pageWidth - margin - 6, currentY + 9, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(203, 213, 225); // #CBD5E1 Slate-300
      doc.text(`Month: ${monthNames[selectedMonth]} ${selectedYear}  |  Audit: ${monthDateRange.shortRange}`, pageWidth - margin - 6, currentY + 16, { align: 'right' });

      currentY += 26;

      // 2. 4 TOP METRIC CARDS
      const cardGap = 3.5;
      const cardWidth = (contentWidth - cardGap * 3) / 4;
      const cardHeight = 18;

      const kpis = [
        {
          title: 'GROSS REVENUE',
          value: `Rs. ${monthlyData.grossSalesRevenue.toLocaleString('en-IN')}`,
          sub: 'Total gross billing',
          color: [2, 132, 199] // Sky Blue #0284C7
        },
        {
          title: 'FOOTWEAR SOLD',
          value: `${monthlyData.totalPairsSold} Pairs`,
          sub: `Across ${monthlyData.completedInvoicesCount} completed invoices`,
          color: [15, 23, 42] // Navy #0F172A
        },
        {
          title: 'STOCK INWARD GROWTH',
          value: `${monthlyData.netInventoryGrowth >= 0 ? '+' : ''}${monthlyData.netInventoryGrowth} Pairs`,
          sub: `${monthlyData.totalStockAddedPairs} Inward vs ${monthlyData.totalPairsSold} Sold`,
          color: [22, 163, 74] // Green #16A34A
        },
        {
          title: 'RETURNS & REFUNDS',
          value: `Rs. ${monthlyData.totalRefundAmount.toLocaleString('en-IN')}`,
          sub: `${monthlyData.returnOrdersCount} orders (${monthlyData.totalReturnedPairs} pairs restocked)`,
          color: [225, 29, 72] // Rose #E11D48
        }
      ];

      kpis.forEach((kpi, idx) => {
        const cardX = margin + idx * (cardWidth + cardGap);
        // Card background & border
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240); // #E2E8F0
        doc.setLineWidth(0.3);
        doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 2, 2, 'FD');

        // Card Label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139); // #64748B
        doc.text(kpi.title, cardX + 3.5, currentY + 5);

        // Card Value
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
        doc.text(kpi.value, cardX + 3.5, currentY + 11);

        // Card Subtitle
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.setTextColor(148, 163, 184); // #94A3B8
        doc.text(kpi.sub, cardX + 3.5, currentY + 15.5);
      });

      currentY += cardHeight + 6;

      // 3. SECTION 1: CATEGORY & SUB-CATEGORY PERFORMANCE
      // Accent bar + Title
      doc.setFillColor(2, 132, 199); // Blue bar
      doc.rect(margin, currentY, 2, 4.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('1. CATEGORY & SUB-CATEGORY PERFORMANCE', margin + 4, currentY + 3.8);
      currentY += 6;

      const catTableBody = monthlyData.categoryPerformanceList.map(c => [
        c.category,
        c.subCategory,
        `${c.units} Pairs`,
        `Rs. ${c.revenue.toLocaleString('en-IN')}`,
        `${c.share.toFixed(1)}%`
      ]);

      // Add Total Performance row
      catTableBody.push([
        'Total Performance',
        '',
        `${monthlyData.totalPairsSold} Pairs`,
        `Rs. ${monthlyData.grossSalesRevenue.toLocaleString('en-IN')}`,
        '100.0%'
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['CATEGORY', 'SUB-CATEGORY', 'PAIRS SOLD', 'REVENUE (Rs.)', 'REVENUE SHARE']],
        body: catTableBody.length > 1 ? catTableBody : [['No Data', 'No subcategories recorded', '0 Pairs', 'Rs. 0', '0.0%']],
        theme: 'plain',
        headStyles: {
          fillColor: [241, 245, 249], // #F1F5F9
          textColor: [51, 65, 85], // #334155
          fontSize: 7,
          fontStyle: 'bold',
          cellPadding: { top: 2, bottom: 2, left: 3, right: 3 }
        },
        styles: {
          fontSize: 7,
          font: 'helvetica',
          textColor: [30, 41, 59],
          cellPadding: { top: 2.2, bottom: 2.2, left: 3, right: 3 },
          lineColor: [241, 245, 249],
          lineWidth: 0.2
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 32 },
          1: { cellWidth: 50 },
          2: { halign: 'center', cellWidth: 30 },
          3: { halign: 'right', fontStyle: 'bold', cellWidth: 36 },
          4: { halign: 'center', fontStyle: 'bold', cellWidth: 34 }
        },
        didParseCell: function(data) {
          // Highlight total row
          if (data.row.index === catTableBody.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [15, 23, 42];
          }
        },
        margin: { left: margin, right: margin }
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;

      // 4. TWO COLUMNS: BRAND DISTRIBUTION (Left) & PAYMENT CHANNEL (Right)
      const colWidth = (contentWidth - 6) / 2;
      const leftColX = margin;
      const rightColX = margin + colWidth + 6;

      // Header Left
      doc.setFillColor(2, 132, 199);
      doc.rect(leftColX, currentY, 2, 4.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('2. BRAND DISTRIBUTION', leftColX + 4, currentY + 3.8);

      // Header Right
      doc.setFillColor(2, 132, 199);
      doc.rect(rightColX, currentY, 2, 4.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('3. PAYMENT CHANNEL BREAKDOWN', rightColX + 4, currentY + 3.8);

      currentY += 6;

      // Brand Data
      const brandBody = monthlyData.brandList.slice(0, 5).map(b => [
        b.brand,
        String(b.pairs),
        `Rs. ${b.revenue.toLocaleString('en-IN')}`,
        `${b.share}%`
      ]);

      // Payment Data
      const paymentBody = monthlyData.paymentChannels.map(p => [
        p.channel,
        String(p.txns),
        `Rs. ${p.amount.toLocaleString('en-IN')}`,
        `${p.share.toFixed(1)}%`
      ]);

      // AutoTable Brand
      autoTable(doc, {
        startY: currentY,
        head: [['BRAND', 'PAIRS', 'REVENUE', 'SHARE']],
        body: brandBody.length > 0 ? brandBody : [['No Data', '0', 'Rs. 0', '0%']],
        theme: 'plain',
        tableWidth: colWidth,
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [51, 65, 85],
          fontSize: 6.5,
          fontStyle: 'bold',
          cellPadding: { top: 1.8, bottom: 1.8, left: 2.5, right: 2.5 }
        },
        styles: {
          fontSize: 6.5,
          font: 'helvetica',
          textColor: [30, 41, 59],
          cellPadding: { top: 2, bottom: 2, left: 2.5, right: 2.5 },
          lineColor: [241, 245, 249],
          lineWidth: 0.2
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 30 },
          1: { halign: 'center', cellWidth: 16 },
          2: { halign: 'right', cellWidth: 24 },
          3: { halign: 'center', fontStyle: 'bold', cellWidth: 18 }
        },
        margin: { left: leftColX, right: pageWidth - leftColX - colWidth }
      });

      const brandFinalY = (doc as any).lastAutoTable.finalY;

      // AutoTable Payment
      autoTable(doc, {
        startY: currentY,
        head: [['CHANNEL', 'TXNS', 'AMOUNT (Rs.)', 'SHARE']],
        body: paymentBody.length > 0 ? paymentBody : [['Cash', '0', 'Rs. 0', '0.0%']],
        theme: 'plain',
        tableWidth: colWidth,
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [51, 65, 85],
          fontSize: 6.5,
          fontStyle: 'bold',
          cellPadding: { top: 1.8, bottom: 1.8, left: 2.5, right: 2.5 }
        },
        styles: {
          fontSize: 6.5,
          font: 'helvetica',
          textColor: [30, 41, 59],
          cellPadding: { top: 2, bottom: 2, left: 2.5, right: 2.5 },
          lineColor: [241, 245, 249],
          lineWidth: 0.2
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 32 },
          1: { halign: 'center', cellWidth: 14 },
          2: { halign: 'right', cellWidth: 24 },
          3: { halign: 'center', fontStyle: 'bold', cellWidth: 18 }
        },
        margin: { left: rightColX, right: margin }
      });

      const paymentFinalY = (doc as any).lastAutoTable.finalY;
      currentY = Math.max(brandFinalY, paymentFinalY) + 6;

      // 5. SECTION 4: TOP-SELLING FOOTWEAR ARTICLES
      doc.setFillColor(2, 132, 199);
      doc.rect(margin, currentY, 2, 4.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('4. TOP-SELLING FOOTWEAR ARTICLES', margin + 4, currentY + 3.8);
      currentY += 6;

      const topArticleBody = monthlyData.topArticles.slice(0, 5).map((art, idx) => {
        const sizeStr = Object.entries(art.sizes)
          .map(([sz, count]) => `${sz}: ${count}`)
          .join('   ') || 'Standard';
        return [
          String(idx + 1),
          art.name,
          art.brand,
          art.category,
          `${art.units} Pairs`,
          sizeStr,
          `Rs. ${art.revenue.toLocaleString('en-IN')}`
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['#', 'ARTICLE NAME', 'BRAND', 'CATEGORY', 'VOLUME', 'SIZE DISTRIBUTION', 'REVENUE']],
        body: topArticleBody.length > 0 ? topArticleBody : [['-', 'No Articles Sold', '-', '-', '-', '-', 'Rs. 0']],
        theme: 'plain',
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [51, 65, 85],
          fontSize: 6.5,
          fontStyle: 'bold',
          cellPadding: { top: 2, bottom: 2, left: 2.5, right: 2.5 }
        },
        styles: {
          fontSize: 6.5,
          font: 'helvetica',
          textColor: [30, 41, 59],
          cellPadding: { top: 2.2, bottom: 2.2, left: 2.5, right: 2.5 },
          lineColor: [241, 245, 249],
          lineWidth: 0.2
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 8, fontStyle: 'bold' },
          1: { fontStyle: 'bold', cellWidth: 42 },
          2: { cellWidth: 22 },
          3: { cellWidth: 20 },
          4: { halign: 'center', fontStyle: 'bold', cellWidth: 22 },
          5: { cellWidth: 46, fontSize: 6 },
          6: { halign: 'right', fontStyle: 'bold', cellWidth: 22 }
        },
        margin: { left: margin, right: margin }
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;

      // 6. KEY EXECUTIVE TAKEAWAYS BOX
      const takeawaysHeight = 16;
      doc.setFillColor(239, 246, 255); // #EFF6FF Light Blue
      doc.setDrawColor(191, 219, 254); // #BFDBFE Light Blue border
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, currentY, contentWidth, takeawaysHeight, 2, 2, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(30, 58, 138); // Deep blue #1E3A8A
      
      const splitText = doc.splitTextToSize(monthlyData.takeawaysText, contentWidth - 8);
      doc.text(splitText, margin + 4, currentY + 5);

      // 7. FOOTER
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Prashant Footwear  •  Monthly Executive Report (${monthDateRange.monthYearShort})`, margin, pageHeight - 8);
      doc.text('Page 1 of 1', pageWidth - margin, pageHeight - 8, { align: 'right' });

      // Save Document
      const filename = `Prashant_Footwear_Monthly_Executive_Report_${monthNames[selectedMonth]}_${selectedYear}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Error generating PDF report. Please try printing or check store logs.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // --- PRINT NATIVE BROWSER ACTION ---
  const handlePrintReport = () => {
    window.print();
  };

  // --- EXPORT CSV SPREADSHEET ---
  const handleExportCsv = () => {
    const csvRows: string[] = [];
    csvRows.push(`PRASHANT FOOTWEAR - MONTHLY EXECUTIVE SALES REPORT (${monthNames[selectedMonth]} ${selectedYear})`);
    csvRows.push(`Audit Period: ${monthDateRange.shortRange}`);
    csvRows.push('');
    csvRows.push('METRIC,VALUE');
    csvRows.push(`Gross Sales Revenue,Rs. ${monthlyData.grossSalesRevenue}`);
    csvRows.push(`Footwear Sold (Pairs),${monthlyData.totalPairsSold}`);
    csvRows.push(`Completed Invoices,${monthlyData.completedInvoicesCount}`);
    csvRows.push(`Stock Inward Growth (Pairs),${monthlyData.netInventoryGrowth}`);
    csvRows.push(`Total Refund Amount,Rs. ${monthlyData.totalRefundAmount}`);
    csvRows.push('');
    csvRows.push('1. CATEGORY PERFORMANCE');
    csvRows.push('Category,Sub-Category,Pairs Sold,Revenue (Rs.),Revenue Share (%)');
    monthlyData.categoryPerformanceList.forEach(c => {
      csvRows.push(`"${c.category}","${c.subCategory}",${c.units},${c.revenue},${c.share.toFixed(1)}%`);
    });
    csvRows.push('');
    csvRows.push('2. BRAND DISTRIBUTION');
    csvRows.push('Brand,Pairs,Revenue (Rs.),Share (%)');
    monthlyData.brandList.forEach(b => {
      csvRows.push(`"${b.brand}",${b.pairs},${b.revenue},${b.share}%`);
    });
    csvRows.push('');
    csvRows.push('3. PAYMENT CHANNEL BREAKDOWN');
    csvRows.push('Channel,Transactions,Amount (Rs.),Share (%)');
    monthlyData.paymentChannels.forEach(p => {
      csvRows.push(`"${p.channel}",${p.txns},${p.amount},${p.share.toFixed(1)}%`);
    });
    csvRows.push('');
    csvRows.push('4. TOP SELLING ARTICLES');
    csvRows.push('Rank,Article Name,Brand,Category,Volume (Pairs),Revenue (Rs.)');
    monthlyData.topArticles.forEach((art, idx) => {
      csvRows.push(`${idx + 1},"${art.name}","${art.brand}","${art.category}",${art.units},${art.revenue}`);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `Prashant_Footwear_Sales_Report_${monthNames[selectedMonth]}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- COPY TEXT SUMMARY FOR WHATSAPP / SMS ---
  const handleCopySummary = () => {
    const summaryText = `📊 *PRASHANT FOOTWEAR - MONTHLY EXECUTIVE REPORT*
📅 *Audit Period:* ${monthNames[selectedMonth]} ${selectedYear} (${monthDateRange.shortRange})
---------------------------------------------
💰 *Gross Revenue:* ₹${monthlyData.grossSalesRevenue.toLocaleString('en-IN')}
👟 *Footwear Sold:* ${monthlyData.totalPairsSold} Pairs (${monthlyData.completedInvoicesCount} Invoices)
📥 *Stock Inward Growth:* ${monthlyData.netInventoryGrowth >= 0 ? '+' : ''}${monthlyData.netInventoryGrowth} Pairs (${monthlyData.totalStockAddedPairs} Added)
🔄 *Returns & Refunds:* ₹${monthlyData.totalRefundAmount.toLocaleString('en-IN')} (${monthlyData.returnOrdersCount} Orders)
---------------------------------------------
🏷️ *Top Category:* ${monthlyData.categoryPerformanceList[0]?.category || 'N/A'} (₹${(monthlyData.categoryPerformanceList[0]?.revenue || 0).toLocaleString('en-IN')})
🏆 *Top Brand:* ${monthlyData.brandList[0]?.brand || 'N/A'} (${monthlyData.brandList[0]?.share || 0}% share)
⭐ *Top Sold Article:* ${monthlyData.topArticles[0]?.name || 'N/A'} (${monthlyData.topArticles[0]?.units || 0} pairs)
---------------------------------------------
${monthlyData.takeawaysText}
_Prashant Footwear ERP System_`;

    navigator.clipboard.writeText(summaryText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="monthly-executive-report-root">
      {/* Control Bar: Period Selection & Action Buttons */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isDark ? 'bg-zinc-900 border-zinc-800 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Month & Year Filter or Custom Range Picker */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
                  <Calendar size={18} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Report Mode:
                </span>
              </div>

              {/* Filter Mode Toggle */}
              <div className="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setFilterMode('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterMode === 'monthly'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Monthly Audit
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('custom_range')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterMode === 'custom_range'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Custom Date Range
                </button>
              </div>

              {filterMode === 'monthly' ? (
                <>
                  {/* Month Select Dropdown */}
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none transition-all cursor-pointer ${
                      isDark 
                        ? 'bg-zinc-950 border-zinc-700 text-sky-400 focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-300 text-sky-700 focus:border-sky-600'
                    }`}
                  >
                    {monthNames.map((name, index) => (
                      <option key={name} value={index} className={isDark ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>
                        {name}
                      </option>
                    ))}
                  </select>

                  {/* Year Select Dropdown */}
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none transition-all cursor-pointer ${
                      isDark 
                        ? 'bg-zinc-950 border-zinc-700 text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600'
                    }`}
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year} className={isDark ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>
                        {year}
                      </option>
                    ))}
                  </select>

                  {/* Quick Jumper Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedYear(currentDate.getFullYear());
                        setSelectedMonth(currentDate.getMonth());
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedYear === currentDate.getFullYear() && selectedMonth === currentDate.getMonth()
                          ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                          : isDark 
                            ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200' 
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Current Month
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const prevMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
                        const prevYear = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
                        setSelectedMonth(prevMonth);
                        setSelectedYear(prevYear);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isDark 
                          ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200' 
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Last Month
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Custom Date Range Pickers */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">From:</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none transition-all ${
                          isDark
                            ? 'bg-zinc-950 border-zinc-700 text-white'
                            : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">To:</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none transition-all ${
                          isDark
                            ? 'bg-zinc-950 border-zinc-700 text-white'
                            : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    {/* Quick Range Presets */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          setStartDate(today);
                          setEndDate(today);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const end = new Date();
                          const start = new Date();
                          start.setDate(end.getDate() - 7);
                          setStartDate(start.toISOString().split('T')[0]);
                          setEndDate(end.toISOString().split('T')[0]);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Last 7 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const end = new Date();
                          const start = new Date();
                          start.setDate(end.getDate() - 30);
                          setStartDate(start.toISOString().split('T')[0]);
                          setEndDate(end.toISOString().split('T')[0]);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Last 30 Days
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase shadow-md shadow-sky-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              title="Download formatted Executive Sales Report PDF"
            >
              {isExportingPdf ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download size={15} className="stroke-[2.5px]" />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isDark 
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Export report data to CSV spreadsheet"
            >
              <FileSpreadsheet size={15} />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrintReport}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isDark 
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Print document"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                copySuccess 
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold' 
                  : isDark 
                    ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white' 
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Copy executive takeaways text"
            >
              {copySuccess ? (
                <>
                  <Check size={14} className="stroke-[3px]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span className="hidden sm:inline">Copy Text</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 12-Month Pill Grid Bar for Instant Single-Click Switching */}
        <div className="mt-4 pt-3 border-t border-slate-200/20 dark:border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-zinc-400 tracking-wider">
              {selectedYear} Monthly Audit Grid:
            </span>
            <span className="text-[11px] font-medium text-sky-600 dark:text-sky-400">
              Active: {monthNames[selectedMonth]} {selectedYear}
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5">
            {monthShortNames.map((mName, idx) => {
              const isSelected = selectedMonth === idx;
              return (
                <button
                  key={mName}
                  type="button"
                  onClick={() => setSelectedMonth(idx)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-400/50'
                      : isDark
                        ? 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{mName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Source Toggle & Sample Mode Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-200/20 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-zinc-400 tracking-wide">Data Source:</span>
            <div className="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setReportDataSource('auto')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reportDataSource === 'auto'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Auto Dynamic
              </button>
              <button
                type="button"
                onClick={() => setReportDataSource('real')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reportDataSource === 'real'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Real Store Invoices ({monthlyData.realCount})
              </button>
              <button
                type="button"
                onClick={() => setReportDataSource('sample')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reportDataSource === 'sample'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sample Analytics
              </button>
            </div>
          </div>

          {monthlyData.isSampleData && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
              <Sparkles size={14} className="animate-pulse" />
              <span>Showing Simulated Store Analytics for {monthNames[selectedMonth]} {selectedYear}</span>
            </div>
          )}
        </div>
      </div>

      {/* --- EXACT PDF PREVIEW CONTAINER (Matching image format 100%) --- */}
      <div 
        ref={printableReportRef}
        className="w-full max-w-5xl mx-auto bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6 print:p-0 print:border-none print:shadow-none print:max-w-none font-sans"
        id="pdf-executive-report-document"
      >
        {/* 1. TOP HEADER BANNER */}
        <div className="bg-[#0F172A] text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          {/* Left Brand Details */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              PRASHANT FOOTWEAR
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Old Kupwad Road, Lovely Circle, Sangli • Tel: +91 95112 44447
            </p>
          </div>

          {/* Right Header Details */}
          <div className="sm:text-right">
            <h2 className="text-sm sm:text-base font-black tracking-wide text-sky-400 uppercase">
              EXECUTIVE SALES REPORT
            </h2>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Month: <strong>{monthNames[selectedMonth]} {selectedYear}</strong> | Audit: <strong>{monthDateRange.shortRange}</strong>
            </p>
          </div>
        </div>

        {/* 2. 4 TOP METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: GROSS REVENUE */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-sky-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                GROSS REVENUE
              </span>
              <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                <IndianRupee size={15} />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-600 my-1.5">
              ₹{monthlyData.grossSalesRevenue.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Total gross sales billing
            </span>
          </div>

          {/* Card 2: ORDERS & FOOTWEAR SOLD */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                ORDERS &amp; SOLD
              </span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ShoppingBag size={15} />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 my-1.5">
              {monthlyData.completedInvoicesCount} <span className="text-sm font-bold text-slate-500">Orders</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {monthlyData.totalPairsSold} Total pairs sold
            </span>
          </div>

          {/* Card 3: ADDED STOCK UNITS */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                ADDED STOCK UNITS
              </span>
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <Package size={15} />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-600 my-1.5">
              {monthlyData.totalStockAddedPairs} <span className="text-sm font-bold text-blue-500">Pairs</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Net Growth: <strong className={monthlyData.netInventoryGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {monthlyData.netInventoryGrowth >= 0 ? `+${monthlyData.netInventoryGrowth}` : monthlyData.netInventoryGrowth} Pairs
              </strong>
            </span>
          </div>

          {/* Card 4: RETURNS & REFUNDS */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-rose-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                RETURNS &amp; REFUNDS
              </span>
              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                <RotateCcw size={15} />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-600 my-1.5">
              ₹{monthlyData.totalRefundAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {monthlyData.returnOrdersCount} orders ({monthlyData.totalReturnedPairs} pairs restocked)
            </span>
          </div>
        </div>

        {/* 3. SECTION 1: CATEGORY & SUB-CATEGORY PERFORMANCE */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-sky-600 rounded-sm" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              1. CATEGORY &amp; SUB-CATEGORY PERFORMANCE
            </h3>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">CATEGORY</th>
                  <th className="py-2.5 px-4">SUB-CATEGORY</th>
                  <th className="py-2.5 px-4 text-center">PAIRS SOLD</th>
                  <th className="py-2.5 px-4 text-right">REVENUE (₹)</th>
                  <th className="py-2.5 px-4 text-center">REVENUE SHARE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {monthlyData.categoryPerformanceList.map((cat, idx) => (
                  <tr key={`${cat.category}-${cat.subCategory}`} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{cat.category}</td>
                    <td className="py-2.5 px-4 text-slate-600">{cat.subCategory}</td>
                    <td className="py-2.5 px-4 text-center font-medium">{cat.units} Pairs</td>
                    <td className="py-2.5 px-4 text-right font-medium">₹{cat.revenue.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        idx === 0 
                          ? 'bg-sky-100 text-sky-700' 
                          : idx === 1 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-rose-100 text-rose-700'
                      }`}>
                        {cat.share.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Total Performance Row */}
                <tr className="bg-slate-50/90 font-bold text-slate-900 border-t border-slate-200">
                  <td className="py-2.5 px-4">Total Performance</td>
                  <td className="py-2.5 px-4"></td>
                  <td className="py-2.5 px-4 text-center">{monthlyData.totalPairsSold} Pairs</td>
                  <td className="py-2.5 px-4 text-right font-bold">₹{monthlyData.grossSalesRevenue.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                      100.0%
                    </span>
                  </td>
                </tr>

                {monthlyData.categoryPerformanceList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No category transactions recorded for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. TWO-COLUMN ROW: BRAND DISTRIBUTION & PAYMENT CHANNEL BREAKDOWN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: 2. BRAND DISTRIBUTION */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-sky-600 rounded-sm" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                2. BRAND DISTRIBUTION
              </h3>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">BRAND</th>
                    <th className="py-2.5 px-3 text-center">PAIRS</th>
                    <th className="py-2.5 px-3 text-right">REVENUE</th>
                    <th className="py-2.5 px-3 text-center">SHARE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {monthlyData.brandList.slice(0, 5).map((b, idx) => (
                    <tr key={b.brand} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 font-bold text-slate-900">{b.brand}</td>
                      <td className="py-2 px-3 text-center">{b.pairs}</td>
                      <td className="py-2 px-3 text-right font-medium">₹{b.revenue.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          idx === 0 
                            ? 'bg-sky-100 text-sky-700' 
                            : idx === 1 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-amber-100 text-amber-700'
                        }`}>
                          {b.share}%
                        </span>
                      </td>
                    </tr>
                  ))}

                  {monthlyData.brandList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400">No brand data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: 3. PAYMENT CHANNEL BREAKDOWN */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-sky-600 rounded-sm" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                3. PAYMENT CHANNEL BREAKDOWN
              </h3>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">CHANNEL</th>
                    <th className="py-2.5 px-3 text-center">TXNS</th>
                    <th className="py-2.5 px-3 text-right">AMOUNT (₹)</th>
                    <th className="py-2.5 px-3 text-center">SHARE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {monthlyData.paymentChannels.map((p, idx) => (
                    <tr key={p.channel} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 font-bold text-slate-900">{p.channel}</td>
                      <td className="py-2 px-3 text-center">{p.txns}</td>
                      <td className="py-2 px-3 text-right font-medium">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.share >= 40 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : p.share > 0 
                              ? 'bg-sky-100 text-sky-700' 
                              : 'bg-slate-100 text-slate-500'
                        }`}>
                          {p.share.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 5. SECTION 4: TOP-SELLING FOOTWEAR ARTICLES */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-sky-600 rounded-sm" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              4. TOP-SELLING FOOTWEAR ARTICLES
            </h3>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-center">#</th>
                  <th className="py-2.5 px-3">ARTICLE NAME</th>
                  <th className="py-2.5 px-3">BRAND</th>
                  <th className="py-2.5 px-3">CATEGORY</th>
                  <th className="py-2.5 px-3 text-center">VOLUME</th>
                  <th className="py-2.5 px-3">SIZE DISTRIBUTION</th>
                  <th className="py-2.5 px-3 text-right">REVENUE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {monthlyData.topArticles.slice(0, 5).map((art, idx) => (
                  <tr key={art.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{art.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{art.brand}</td>
                    <td className="py-2.5 px-3 text-slate-600">{art.category}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900">{art.units} Pairs</td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(art.sizes).map(([sz, count]) => (
                          <span key={sz} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700">
                            <strong>{sz}:</strong> {count}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ₹{art.revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}

                {monthlyData.topArticles.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      No footwear articles sold in {monthNames[selectedMonth]} {selectedYear}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. KEY EXECUTIVE TAKEAWAYS BOX */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-sky-50/80 border border-sky-200 text-sky-950 text-xs leading-relaxed">
          <p>
            {monthlyData.takeawaysText}
          </p>
        </div>

        {/* 7. FOOTER */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Prashant Footwear • Monthly Executive Report ({monthDateRange.monthYearShort})</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};
