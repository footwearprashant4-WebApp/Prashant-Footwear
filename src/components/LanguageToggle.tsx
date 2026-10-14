import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageToggleProps {
  isNavbarDark?: boolean;
  variant?: 'default' | 'golden';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ isNavbarDark = false, variant = 'default' }) => {
  const { language, setLanguage } = useLanguage();

  if (variant === 'golden') {
    return (
      <div className="h-[42px] inline-flex items-center rounded-full px-3 sm:px-3.5 bg-gradient-to-r from-[#DFBA73] to-[#A6803D] hover:from-[#EDC985] hover:to-[#BFA052] text-[#120F0C] shadow-lg shadow-[#DFBA73]/10 text-[10px] sm:text-xs font-black uppercase tracking-widest shrink-0 transition-all duration-200">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`text-[10px] sm:text-xs font-black tracking-wider transition-all duration-200 cursor-pointer ${
            language === 'en'
              ? 'text-[#120F0C] font-black underline underline-offset-2'
              : 'text-[#120F0C]/60 hover:text-[#120F0C]'
          }`}
        >
          EN
        </button>
        <span className="mx-1.5 text-[#120F0C]/40 font-bold select-none">|</span>
        <button
          type="button"
          onClick={() => setLanguage('mr')}
          className={`text-[10px] sm:text-xs font-black tracking-wider transition-all duration-200 cursor-pointer ${
            language === 'mr'
              ? 'text-[#120F0C] font-black underline underline-offset-2'
              : 'text-[#120F0C]/60 hover:text-[#120F0C]'
          }`}
        >
          मराठी
        </button>
      </div>
    );
  }

  return (
    <div
      className={`h-[42px] inline-flex items-center rounded-full px-2.5 sm:px-3.5 border shrink-0 transition-all duration-300 ${
        isNavbarDark
          ? 'bg-black/50 border-white/15 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]'
          : 'bg-zinc-100 border-zinc-200/80 text-zinc-800 shadow-inner'
      }`}
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`text-[10px] sm:text-[11px] font-bold tracking-wider transition-all duration-200 cursor-pointer ${
          language === 'en'
            ? isNavbarDark
              ? 'text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]'
              : 'text-zinc-950 font-black'
            : isNavbarDark
              ? 'text-zinc-400 hover:text-zinc-200'
              : 'text-zinc-400 hover:text-zinc-700'
        }`}
      >
        EN
      </button>
      <span className={`mx-1.5 sm:mx-2 text-[10px] select-none ${isNavbarDark ? 'text-zinc-600' : 'text-zinc-300'}`}>
        |
      </span>
      <button
        type="button"
        onClick={() => setLanguage('mr')}
        className={`text-[10px] sm:text-[11px] font-bold transition-all duration-200 cursor-pointer ${
          language === 'mr'
            ? isNavbarDark
              ? 'text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]'
              : 'text-zinc-950 font-black'
            : isNavbarDark
              ? 'text-zinc-400 hover:text-zinc-200'
              : 'text-zinc-400 hover:text-zinc-700'
        }`}
      >
        मराठी
      </button>
    </div>
  );
};

