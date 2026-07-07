import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageToggleProps {
  isNavbarDark?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ isNavbarDark = false }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`inline-flex items-center rounded-full p-0.5 border shrink-0 transition-all duration-300 ${
      isNavbarDark
        ? 'bg-black/50 border-white/15 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] text-white'
        : 'bg-zinc-100 border-zinc-200/80 text-zinc-800 shadow-inner'
    }`}>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black tracking-wider rounded-full transition-all duration-300 cursor-pointer ${
          language === 'en'
            ? isNavbarDark
              ? 'bg-amber-500 text-black shadow-[0_2px_8px_rgba(245,158,11,0.3)] scale-105 font-black'
              : 'bg-zinc-950 text-white shadow-sm scale-105 font-black'
            : isNavbarDark
              ? 'text-zinc-400 hover:text-white hover:bg-white/5'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-black/5'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('mr')}
        className={`px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black rounded-full transition-all duration-300 cursor-pointer font-sans ${
          language === 'mr'
            ? isNavbarDark
              ? 'bg-amber-500 text-black shadow-[0_2px_8px_rgba(245,158,11,0.3)] scale-105 font-black'
              : 'bg-zinc-950 text-white shadow-sm scale-105 font-black'
            : isNavbarDark
              ? 'text-zinc-400 hover:text-white hover:bg-white/5'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-black/5'
        }`}
      >
        मराठी
      </button>
    </div>
  );
};

