import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Printer, ArrowLeft, CheckCircle2, MessageSquare, Copy, Check, ShoppingBag, ShieldCheck, Package } from 'lucide-react';

interface InvoiceViewerProps {
  invoiceId: string;
  onClose: () => void;
}

export const InvoiceViewer: React.FC<InvoiceViewerProps> = ({ invoiceId, onClose }) => {
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'orders', invoiceId);
        const docSnap = await getDoc(docRef);
        
    if (docSnap.exists()) {
          setOrder({
            id: docSnap.id,
            ...docSnap.data()
          });

          // Auto-trigger print if requested via link parameter
          const params = new URLSearchParams(window.location.search);
          if (params.get('print') === 'true') {
            setTimeout(() => {
              window.print();
            }, 600);
          }
        } else {
          setError('Invoice not found in our database system. Please verify the link or contact support.');
        }
      } catch (err: any) {
        console.error('Error fetching invoice:', err);
        setError('Failed to securely load the invoice. Please try again or check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="font-mono text-xs text-slate-500 uppercase tracking-widest font-bold">
            Verifying Transaction ID...
          </p>
          <p className="text-[11px] text-slate-400">
            Securely retrieving digital invoice from Prashant Footwear Database
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-xl text-center space-y-5">
          <div className="w-14 h-14 bg-rose-50 border border-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <ArrowLeft size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Unable to Fetch Invoice</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => {
              window.location.href = window.location.origin;
            }}
            className="w-full py-3 bg-slate-950 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} /> Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Calculate taxes and subtotals
  const subtotal = order.items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0);
  const discount = subtotal - order.totalAmount;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 antialiased py-6 px-4 md:py-12 print:bg-white print:py-0 print:px-0">
      
      {/* Dynamic top bar - hidden on print */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-col sm:flex-row gap-3 justify-between items-center print:hidden bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-md">
        <button
          onClick={onClose}
          className="text-xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-950 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowLeft size={14} /> Return To Shop
        </button>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600 stroke-[3px]" /> Copied!
              </>
            ) : (
              <>
                <Copy size={14} /> Copy Invoice Link
              </>
            )}
          </button>

          <button
            onClick={() => {
              const waText = `*Prashant Footwear Invoice* 🧾%0AI have viewed my digital bill online!%0A*Invoice ID:* ${order.id}%0A*Total Amount:* ₹${order.totalAmount}%0A*Link:* ${window.location.href}`;
              window.open(`https://wa.me/919876543210?text=${waText}`, '_blank');
            }}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <MessageSquare size={14} /> Contact Shop
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-slate-950/10 active:scale-95"
          >
            <Printer size={14} /> Print Invoice
          </button>
        </div>
      </div>

      {/* Actual Printable Invoice Container */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none print:rounded-none">
        
        {/* Invoice Top Ribbon Indicator */}
        <div className="bg-slate-950 p-4 flex justify-between items-center print:hidden">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" /> Secure Digital Document
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
            Payment Status: PAID
          </span>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-100">
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-slate-950">PRASHANT FOOTWEAR</h1>
              <p className="text-xs text-slate-500 max-w-md font-medium">
                Premium Multi-brand footwear retail store and custom workshop. On old Kupwad Road, Lovley Circle Sangli
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400 font-mono">
                <span>Contact: <b className="text-slate-600">+91 95112 44447</b></span>
              </div>
            </div>

            <div className="text-left md:text-right space-y-1 md:self-stretch flex flex-col justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block">TAX INVOICE</span>
              <div>
                <h4 className="text-sm font-mono font-black text-slate-900">{order.id}</h4>
                <p className="text-xs text-slate-400 mt-1">Date: {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Bill To & Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 font-sans print:bg-white print:border-slate-200">
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-black">BILLED CUSTOMER</span>
              <h3 className="text-sm font-black text-slate-950 uppercase">{order.customerName}</h3>
              <p className="text-xs text-slate-500 font-mono">Mobile: +91 {order.customerMobile}</p>
            </div>

            <div className="space-y-1.5 md:text-right">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-black">TRANSACTION INFO</span>
              <p className="text-xs font-semibold text-slate-700">Payment Option: <span className="uppercase font-black text-slate-950 font-mono">{order.paymentMethod}</span></p>
              <p className="text-xs font-semibold text-slate-700">Delivery: <span className="uppercase font-black text-slate-950">In-Store Collection</span></p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-black">PURCHASE STYLE BREAKDOWN</span>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-black text-[10px] tracking-wider uppercase font-mono">
                    <th className="py-3 px-1">#</th>
                    <th className="py-3 px-2">Footwear Style Name</th>
                    <th className="py-3 px-2 text-center">Category</th>
                    <th className="py-3 px-2 text-center font-mono">Size (UK)</th>
                    <th className="py-3 px-2 text-right">Unit Price</th>
                    <th className="py-3 px-2 text-center">Qty</th>
                    <th className="py-3 px-1 text-right">Net Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((it: any, index: number) => (
                    <tr key={index} className="text-slate-800">
                      <td className="py-4 px-1 font-mono text-slate-400">{index + 1}</td>
                      <td className="py-4 px-2 font-black text-slate-950 uppercase">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {it.imageUrl ? (
                              <img src={it.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <Package size={16} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p>{it.name}</p>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5 font-normal">
                              {it.articleCode ? `Art: ${it.articleCode}` : `SKU: ${it.productId}`}
                              {it.color ? ` • ${it.color}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className="inline-block bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                          {it.category || 'Footwear'}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-center font-mono font-bold text-slate-950">{it.size}</td>
                      <td className="py-4 px-2 text-right font-mono font-medium">₹{it.price}</td>
                      <td className="py-4 px-2 text-center font-mono font-bold">{it.quantity}</td>
                      <td className="py-4 px-1 text-right font-mono font-black text-slate-950">₹{it.price * it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-6 border-t border-slate-100">
            
            {/* Payment Verification Stamp */}
            <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 max-w-xs space-y-1.5 print:border-slate-300">
              <span className="text-[9px] font-mono text-slate-400 font-black uppercase tracking-wider block">Important Notes & Policy</span>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Thank you for choosing Prashant Footwear! Goods once sold will not be refunded. However, exchanges are happily allowed within 7 days from invoice date with standard unused packaging and this digital bill copy.
              </p>
            </div>

            {/* Calculations Panel */}
            <div className="w-full md:w-80 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Total Items Value:</span>
                <span className="font-mono text-slate-800 font-semibold">₹{subtotal}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Special Discount Applied:</span>
                  <span className="font-mono">-₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between font-black text-sm text-slate-950 pt-2.5 border-t border-slate-200">
                <span className="uppercase tracking-wide">Grand Net Amount:</span>
                <span className="font-mono text-lg text-emerald-600">₹{order.totalAmount}</span>
              </div>
            </div>

          </div>

          {/* Barcode / Authenticity footer */}
          <div className="text-center pt-8 border-t border-slate-100 space-y-2">
            <div className="h-10 w-44 bg-slate-950 mx-auto flex items-center justify-between px-3 text-[7px] text-white select-none">
              |||| | ||||| ||| | | ||||| | |||| | |||||| || | | ||
            </div>
            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
              PRASHANT FOOTWEAR POS AUTHENTICITY ASSURED
            </p>
          </div>

        </div>
      </div>
      
    </div>
  );
};
