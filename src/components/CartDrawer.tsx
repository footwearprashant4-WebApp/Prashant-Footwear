import React from 'react';
import { CartItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (productId: string, size: number, newQty: number) => void;
  onRemoveItem: (productId: string, size: number) => void;
  onClearCart: () => void;
  onOpenAuth: () => void;
  theme?: 'dark' | 'light';
}

const WhatsAppIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.586 1.771.884 2.802.884 3.176 0 5.764-2.587 5.765-5.766.001-3.18-2.585-5.771-5.771-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.134-.523-1.636-.677-2.673-2.339-2.755-2.449-.082-.11-.663-.883-.663-1.684 0-.801.421-1.196.572-1.358.151-.162.33-.203.441-.203.111 0 .222 0 .319.005.104.005.244-.04.381.289.144.346.491 1.2.534 1.288.043.088.072.19.014.305-.058.115-.087.187-.173.289l-.26.307c-.087.098-.178.204-.077.378.101.173.45 1.743 1.264 2.067.362.144.666.182.909.117.297-.08.647-.736.738-.988.091-.253.091-.471.064-.518-.027-.046-.118-.073-.244-.136z" />
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.178L2 22l4.981-1.408A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167a8.136 8.136 0 01-4.275-1.207l-.307-.183-2.969.84.852-2.898-.2-.319A8.137 8.137 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z" />
  </svg>
);

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  const totalPairs = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const SHOP_OWNER_WHATSAPP = '919511244447';

  const handleShareToWhatsApp = () => {
    if (cartItems.length === 0) return;

    let text = `*🛍️ NEW ORDER ENQUIRY - PRASHANT FOOTWEAR*\n` +
      `*To: Shop Owner (Prashant Footwear)*\n` +
      `----------------------------------------\n`;

    cartItems.forEach((item, idx) => {
      text += `${idx + 1}. *${item.product.name}*\n` +
        `   • Size: UK ${item.selectedSize}\n` +
        `   • Qty: ${item.quantity} Pair${item.quantity > 1 ? 's' : ''}\n` +
        `   • Rate: ₹${item.product.price} (Subtotal: ₹${item.product.price * item.quantity})\n`;
    });

    text += `----------------------------------------\n` +
      `*📦 Total Quantity:* ${totalPairs} Pair${totalPairs > 1 ? 's' : ''}\n` +
      `*💰 GRAND TOTAL:* ₹${subtotal}\n`;

    if (currentUser?.mobile) {
      text += `*📱 Customer WhatsApp / Mobile:* ${currentUser.mobile}\n`;
    }

    text += `----------------------------------------\n` +
      `_Hello Shop Owner! I would like to order the items listed above. Please confirm product availability, store pickup/delivery, and payment details._`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${SHOP_OWNER_WHATSAPP}&text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <AnimatePresence>
      <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 overflow-hidden">
        {/* Overlay backdrop with smooth fade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`w-screen max-w-md shadow-2xl flex flex-col justify-between transition-colors duration-200 ${
              isDark
                ? 'bg-zinc-950 border-l border-zinc-800/80 text-zinc-100'
                : 'bg-white border-l border-zinc-200 text-zinc-900'
            }`}
          >
            {/* Header */}
            <div className={`px-6 py-5 border-b flex items-center justify-between ${
              isDark
                ? 'border-zinc-800/80 bg-zinc-950/60'
                : 'border-zinc-200 bg-zinc-50/70'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border flex items-center justify-center ${
                  isDark
                    ? 'bg-amber-400/10 border-amber-400/20 text-gold'
                    : 'bg-amber-100 border-amber-300 text-amber-700'
                }`}>
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="serif-display text-base font-black tracking-wider uppercase flex items-center gap-2">
                    YOUR CART
                  </h3>
                  <p className={`text-[11px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {totalPairs} {totalPairs === 1 ? 'pair selected' : 'pairs selected'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button
                    onClick={onClearCart}
                    className={`text-[11px] font-mono uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      isDark
                        ? 'border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-900/40 hover:bg-rose-500/10'
                        : 'border-zinc-200 text-zinc-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50'
                    }`}
                    title="Clear all items in cart"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={onClose}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:border-zinc-700'
                      : 'border-zinc-200 bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
                  }`}
                  aria-label="Close cart"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Cart Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4 space-y-4">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border shadow-inner ${
                    isDark
                      ? 'bg-zinc-900/80 border-zinc-800 text-zinc-600'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-400'
                  }`}>
                    <ShoppingBag size={36} strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-base font-bold uppercase tracking-wide ${
                      isDark ? 'text-zinc-200' : 'text-zinc-800'
                    }`}>
                      Your cart is empty
                    </h4>
                    <p className={`text-xs max-w-[240px] mx-auto leading-relaxed ${
                      isDark ? 'text-zinc-500' : 'text-zinc-500'
                    }`}>
                      Explore our premium footwear collection and add your favorite pairs.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-2 px-5 py-2.5 bg-gold hover:bg-amber-400 text-black text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-transform active:scale-95 cursor-pointer shadow-md shadow-amber-500/10"
                  >
                    ← Browse Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-3 divide-y-0">
                  <div className="flex items-center justify-between pb-1">
                    <span className={`text-[11px] font-mono uppercase tracking-widest font-bold ${
                      isDark ? 'text-zinc-400' : 'text-zinc-500'
                    }`}>
                      Selected Items
                    </span>
                    <span className={`text-[11px] font-mono ${
                      isDark ? 'text-zinc-500' : 'text-zinc-400'
                    }`}>
                      {cartItems.length} {cartItems.length === 1 ? 'article' : 'articles'}
                    </span>
                  </div>

                  {cartItems.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={`${item.product.id}-${item.selectedSize}`}
                      className={`p-3.5 rounded-2xl border transition-all flex gap-3.5 items-center ${
                        isDark
                          ? 'bg-zinc-900/40 border-zinc-800/90 hover:border-zinc-700'
                          : 'bg-zinc-50/80 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      {/* Product Thumbnail with Size Tag */}
                      <div className="relative shrink-0">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className={`w-18 h-18 object-cover rounded-xl border ${
                            isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'
                          }`}
                        />
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-black text-gold border border-gold/40 text-[9px] font-mono font-bold">
                          UK {item.selectedSize}
                        </span>
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-xs font-bold leading-tight truncate ${
                              isDark ? 'text-zinc-100' : 'text-zinc-900'
                            }`}>
                              {item.product.name}
                            </h4>
                            <span className={`font-mono text-xs font-black shrink-0 ${
                              isDark ? 'text-gold' : 'text-amber-700'
                            }`}>
                              ₹{item.product.price * item.quantity}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-mono uppercase tracking-wider ${
                              isDark ? 'text-zinc-400' : 'text-zinc-500'
                            }`}>
                              ₹{item.product.price} / pair
                            </span>
                            {item.product.brand && (
                              <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono uppercase ${
                                isDark
                                  ? 'border-zinc-800 bg-zinc-900 text-zinc-400'
                                  : 'border-zinc-200 bg-white text-zinc-600'
                              }`}>
                                {item.product.brand}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Controls: Quantity + Remove */}
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800/80">
                          {/* Quantity Pill */}
                          <div className={`flex items-center border rounded-lg overflow-hidden ${
                            isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-white'
                          }`}>
                            <button
                              onClick={() => onUpdateQty(item.product.id, item.selectedSize, item.quantity - 1)}
                              className={`px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                                isDark
                                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                              }`}
                              title="Decrease quantity"
                            >
                              −
                            </button>
                            <span className={`px-2.5 text-xs font-mono font-bold ${
                              isDark ? 'text-zinc-200' : 'text-zinc-800'
                            }`}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQty(item.product.id, item.selectedSize, item.quantity + 1)}
                              className={`px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                                isDark
                                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                              }`}
                              title="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          {/* Delete Item */}
                          <button
                            onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark
                                ? 'text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10'
                                : 'text-zinc-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title="Remove from cart"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary & WhatsApp Order CTA */}
            {cartItems.length > 0 && (
              <div className={`p-6 border-t space-y-4 ${
                isDark
                  ? 'border-zinc-800/90 bg-zinc-950/80 backdrop-blur-sm'
                  : 'border-zinc-200 bg-zinc-50/90 backdrop-blur-sm'
              }`}>
                {/* Cost Breakdown Card */}
                <div className={`p-4 rounded-2xl border space-y-2.5 ${
                  isDark
                    ? 'bg-zinc-900/60 border-zinc-800/90'
                    : 'bg-white border-zinc-200 shadow-sm'
                }`}>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                      Total Items ({totalPairs} pairs)
                    </span>
                    <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                      ₹{subtotal}
                    </span>
                  </div>

                  <div className={`pt-2.5 border-t flex justify-between items-baseline ${
                    isDark ? 'border-zinc-800' : 'border-zinc-100'
                  }`}>
                    <div>
                      <span className={`text-xs font-mono uppercase tracking-wider font-bold ${
                        isDark ? 'text-zinc-300' : 'text-zinc-700'
                      }`}>
                        GRAND TOTAL
                      </span>
                      <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Taxes included
                      </p>
                    </div>
                    <span className="text-xl font-black font-mono text-gold tracking-tight">
                      ₹{subtotal}
                    </span>
                  </div>
                </div>

                {/* Primary WhatsApp Share CTA */}
                <div className="space-y-2">
                  <button
                    id="send-order-to-shop-owner-btn"
                    onClick={handleShareToWhatsApp}
                    className="w-full py-4 px-5 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-extrabold text-xs tracking-wider rounded-2xl uppercase flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                  >
                    <WhatsAppIcon size={19} className="text-white" />
                    <span>SEND ORDER TO SHOP OWNER</span>
                  </button>

                  <p className={`text-center text-[11px] font-mono leading-relaxed ${
                    isDark ? 'text-zinc-400' : 'text-zinc-600'
                  }`}>
                    💬 Sends order directly to Shop Owner WhatsApp: <span className="font-bold text-emerald-500 font-mono">+91 9511244447</span>
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
