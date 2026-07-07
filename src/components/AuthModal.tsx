import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, Lock, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  prefill?: { mobile: string; pass: string } | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose,
  initialMode = 'login',
  prefill
}) => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync state with open/prefill/initialMode
  useEffect(() => {
    if (isOpen) {
      setIsRegisterMode(initialMode === 'register');
      setError(null);
      if (prefill) {
        setMobile(prefill.mobile);
        setPassword(prefill.pass);
      } else {
        setMobile('');
        setPassword('');
      }
    }
  }, [isOpen, initialMode, prefill]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        const res = await register(mobile, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Registration failed');
        }
      } else {
        const res = await login(mobile, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Login failed');
        }
      }
    } catch (e: any) {
      setError('An unexpected error occurred. Please check your Firestore rules.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div id="auth-modal-backdrop" className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
        {/* Outer overlay click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Glowing element */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-gold/5 rounded-full blur-3xl" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full border border-zinc-900 bg-zinc-900/40 text-zinc-400 hover:text-white hover:border-zinc-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* Logo and Greeting */}
          <div className="text-center mt-4 mb-8">
            <span className="font-mono text-[10px] text-gold tracking-widest font-black uppercase">
              PRASHANT FOOTWEAR AUTH
            </span>
            <h3 className="serif-display text-xl md:text-2xl font-bold text-white uppercase mt-1 tracking-tight">
              {isRegisterMode ? 'CREATE ACCOUNT' : 'SECURE LOG IN'}
            </h3>
            <p className="text-xs text-zinc-500 mt-1.5 max-w-[280px] mx-auto">
              {isRegisterMode
                ? 'Register with your mobile number to checkout and track order logs.'
                : 'Enter your credentials to access your customer space or admin dashboard.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-rose-400 text-xs"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider font-bold">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Phone size={14} />
                </span>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9999999999"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 focus:border-white rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider font-bold">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 focus:border-white rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-xs tracking-widest uppercase transition-colors hover:bg-gold duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer mt-6 shadow-xl shadow-white/5"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound size={13} />
                  {isRegisterMode ? 'CREATE MY ACCOUNT' : 'LOGIN SECURELY'}
                </>
              )}
            </button>
          </form>

          {/* Toggle Register/Login Link */}
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError(null);
              }}
              className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer font-medium underline"
            >
              {isRegisterMode ? 'Already have an account? Log In' : "Don't have an account? Register"}
            </button>
          </div>

          {/* Admin Account Tips Drawer (Super nice UI) */}
          {!isRegisterMode && (
            <div className="mt-8 p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-gold uppercase tracking-widest">
                <Sparkles size={11} /> ADMIN WORKSPACE ACCESS
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal">
                To access the full **Admin Dashboard** (Billing, Stock, Catalog, and Sales Reports), use our pre-seeded admin login:
              </p>
              <div className="flex justify-between font-mono text-[9px] text-zinc-400 bg-zinc-900/40 p-2 rounded-lg border border-zinc-800">
                <span>MOBILE: <strong className="text-white select-all">9511244447</strong></span>
                <span>PASS: <strong className="text-white select-all">Prashant</strong></span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
