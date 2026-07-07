import React, { useState } from 'react';
import { CartItem, Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag, CreditCard, ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (productId: string, size: number, newQty: number) => void;
  onRemoveItem: (productId: string, size: number) => void;
  onClearCart: () => void;
  onOpenAuth: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenAuth,
}) => {
  const { currentUser } = useAuth();
  const { createOrder } = useProducts();
  
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const orderItems = cartItems.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      category: item.product.category,
      subCategory: item.product.subCategory,
      price: item.product.price,
      quantity: item.quantity,
      size: item.selectedSize
    }));

    try {
      const res = await createOrder({
        customerMobile: currentUser.mobile,
        items: orderItems,
        totalAmount: subtotal,
        paymentMethod,
        status: 'pending' // client order defaults to pending until processed or approved
      });

      if (res.success) {
        setSuccessMsg(`Order ${res.id} placed successfully! Thank you for purchasing from Prashant Footwear.`);
        onClearCart();
      } else {
        setErrorMsg(res.error || 'Failed to place order. Please try again.');
      }
    } catch (e) {
      setErrorMsg('An unexpected error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 overflow-hidden">
        {/* Overlay backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            className="w-screen max-w-md bg-zinc-950 border-l border-zinc-900 shadow-2xl p-6 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
              <h3 className="serif-display text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ShoppingBag size={18} className="text-gold" /> YOUR SHOPPING BAG
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-zinc-900 bg-zinc-900/40 text-zinc-500 hover:text-white hover:border-zinc-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Success panel */}
            {successMsg ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="p-4 bg-gold/5 border border-gold/15 text-gold rounded-full animate-bounce">
                  <CheckCircle size={36} />
                </div>
                <h4 className="serif-display text-lg font-bold text-white uppercase tracking-tight">ORDER CONFIRMED!</h4>
                <p className="text-xs text-zinc-400 leading-normal max-w-xs">{successMsg}</p>
                <button
                  onClick={() => {
                    setSuccessMsg(null);
                    onClose();
                  }}
                  className="mt-6 px-6 py-2.5 bg-white text-black text-xs font-bold rounded-xl uppercase tracking-widest hover:bg-gold transition-colors cursor-pointer"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            ) : (
              <>
                {/* Scrollable Cart Items */}
                <div className="flex-1 overflow-y-auto py-4 divide-y divide-zinc-900/60 pr-2">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-24 text-zinc-500 space-y-3">
                      <p className="text-sm">Your shopping bag is completely empty.</p>
                      <button
                        onClick={onClose}
                        className="text-xs text-gold hover:underline font-mono uppercase tracking-wider font-bold"
                      >
                        ← Explore Styles
                      </button>
                    </div>
                  ) : (
                    cartItems.map((item, idx) => (
                      <div key={`${item.product.id}-${item.selectedSize}`} className="py-4 flex gap-4">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 object-cover rounded-xl border border-zinc-900 shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-bold text-zinc-200 line-clamp-1">{item.product.name}</h4>
                              <span className="font-mono text-xs text-gold font-bold">₹{item.product.price * item.quantity}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                              Size: UK {item.selectedSize} | Price: ₹{item.product.price}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Control */}
                            <div className="flex items-center border border-zinc-900 bg-zinc-900/30 rounded-lg">
                              <button
                                onClick={() => onUpdateQty(item.product.id, item.selectedSize, item.quantity - 1)}
                                className="px-2 py-1 text-xs text-zinc-500 hover:text-white cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-mono font-bold text-zinc-300">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateQty(item.product.id, item.selectedSize, item.quantity + 1)}
                                className="px-2 py-1 text-xs text-zinc-500 hover:text-white cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                              className="text-zinc-600 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer, Pricing & Checkout */}
                {cartItems.length > 0 && (
                  <div className="pt-4 border-t border-zinc-900 space-y-4">
                    {errorMsg && (
                      <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] rounded-lg">
                        {errorMsg}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between font-mono text-xs">
                        <span className="text-zinc-500">Cart Subtotal:</span>
                        <span className="text-zinc-300 font-bold">₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between font-mono text-sm border-t border-zinc-900/60 pt-2 font-black">
                        <span className="text-white">GRAND TOTAL:</span>
                        <span className="text-gold font-black">₹{subtotal}</span>
                      </div>
                    </div>

                    {/* Checkout Form or Info */}
                    {currentUser ? (
                      <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-zinc-500">CUSTOMER MOBILE</span>
                          <span className="text-zinc-200 font-bold">{currentUser.mobile}</span>
                        </div>

                        {/* Payment Selection */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                            Payment Option
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {['Cash', 'UPI'].map(method => {
                              const isSel = paymentMethod === method;
                              return (
                                <button
                                  key={method}
                                  onClick={() => setPaymentMethod(method)}
                                  className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer border ${
                                    isSel
                                      ? 'bg-zinc-900 text-gold border-gold/40'
                                      : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:border-zinc-800'
                                  }`}
                                >
                                  {method}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          onClick={handleCheckout}
                          disabled={loading}
                          className="w-full mt-2 py-3 bg-white text-black font-extrabold text-xs tracking-wider rounded-xl hover:bg-gold hover:text-black uppercase flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {loading ? (
                            <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <CreditCard size={12} /> SECURE CHECKOUT
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={onOpenAuth}
                        className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-white text-zinc-300 hover:text-black border border-zinc-800 hover:border-white font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                      >
                        LOG IN WITH MOBILE TO CHECKOUT
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
