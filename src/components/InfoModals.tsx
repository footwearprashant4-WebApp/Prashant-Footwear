import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, Eye, Heart, MapPin, Mail, PhoneCall } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'about' | 'contact';
}

export const InfoModals: React.FC<InfoModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
        {/* Click outside to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden text-left"
        >
          {/* Glowing element */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-gold/5 rounded-full blur-3xl" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full border border-zinc-900 bg-zinc-900/40 text-zinc-400 hover:text-white hover:border-zinc-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {type === 'about' ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <span className="font-mono text-[9px] text-gold font-bold uppercase tracking-widest">About the Brand</span>
                <h3 className="serif-display text-xl font-bold text-white uppercase tracking-tight mt-1">PRASHANT FOOTWEAR</h3>
                <div className="h-[1px] w-12 bg-zinc-800 mt-3" />
              </div>

              <div className="space-y-4 text-xs text-zinc-400 leading-relaxed font-medium">
                <p>
                  Established in 1995, <strong className="text-white">Prashant Footwear</strong> has been the pioneer of luxury comfort, bespoke styling, and durable designs in executive fashion.
                </p>
                <p>
                  Our workshop merges traditional mastercraftsmanship with state-of-the-art dynamic cushioning. Every shoe, boot, slip-on, or sandal in our catalog goes through 48 hours of precise stress testing to match international comfort standards.
                </p>
              </div>

              {/* Core Values */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-900 text-center">
                <div className="flex flex-col items-center">
                  <Award size={16} className="text-gold mb-1" />
                  <span className="text-[10px] font-bold text-zinc-300 font-sans uppercase">Quality</span>
                </div>
                <div className="flex flex-col items-center">
                  <Eye size={16} className="text-gold mb-1" />
                  <span className="text-[10px] font-bold text-zinc-300 font-sans uppercase">Precision</span>
                </div>
                <div className="flex flex-col items-center">
                  <Heart size={16} className="text-gold mb-1" />
                  <span className="text-[10px] font-bold text-zinc-300 font-sans uppercase">Comfort</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <span className="font-mono text-[9px] text-gold font-bold uppercase tracking-widest">Connect with Us</span>
                <h3 className="serif-display text-xl font-bold text-white uppercase tracking-tight mt-1">CONTACT US</h3>
                <div className="h-[1px] w-12 bg-zinc-800 mt-3" />
              </div>

              {/* Contact list details */}
              <div className="space-y-4 pt-4 text-xs">
                <div className="flex items-start gap-3.5 p-3.5 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
                  <MapPin size={18} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-zinc-300">HEADQUARTERS</h5>
                    <p className="text-zinc-500 mt-1 leading-normal">
                      Prashant Footwear Galleria, Suite 100, Sector 15, New Delhi, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
                  <Mail size={18} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-zinc-300">SUPPORT DESK EMAIL</h5>
                    <p className="text-zinc-500 mt-1 leading-normal font-mono">
                      footwearprashant4@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
                  <PhoneCall size={18} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-zinc-300">ADMIN HOTLINE</h5>
                    <p className="text-zinc-500 mt-1 leading-normal font-mono">
                      +91 (011) 4921-9090
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
