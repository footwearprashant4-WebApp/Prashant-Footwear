import React, { useState, useRef, useMemo } from 'react';
import { BrandConfig } from '../types';
import { 
  useProducts, 
  WALKAROO_DEFAULT_LOGO, 
  WALKAROO_DEFAULT_BANNER,
  WALKMATE_DEFAULT_LOGO,
  WALKMATE_DEFAULT_BANNER,
  YONO_DEFAULT_LOGO,
  YONO_DEFAULT_BANNER,
  INDUS_DEFAULT_LOGO,
  INDUS_DEFAULT_BANNER
} from '../context/ProductContext';
import { 
  Plus, Edit3, Trash2, CheckCircle2, ShieldCheck, Tv, Award, 
  ExternalLink, Sparkles, Check, X, Video, Image as ImageIcon, Link as LinkIcon, RefreshCw,
  Upload, Eye, Palette, Search, SlidersHorizontal, ArrowUpRight, Copy, CheckCheck,
  Layers, Info, Shield, HelpCircle, Database, Save, ArrowLeft, ChevronRight, LayoutGrid, CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface BrandManagementSectionProps {
  theme?: 'dark' | 'light';
}

const PRESET_BRAND_LOGOS = [
  {
    name: 'Walkaroo (Official Crimson)',
    url: WALKAROO_DEFAULT_LOGO,
    brandHint: 'Walkaroo',
    taglineHint: 'Be Restless',
    accentColorHint: '#BE123C',
    mediaTypeHint: 'banner' as const
  },
  {
    name: 'Indus Footwear (Deep Teal)',
    url: INDUS_DEFAULT_LOGO,
    brandHint: 'Indus',
    taglineHint: 'Engineered Comfort • High-Durability Daily Footwear',
    accentColorHint: '#0D9488',
    mediaTypeHint: 'banner' as const
  },
  {
    name: 'Walkmate Comfort (Ocean Cobalt)',
    url: WALKMATE_DEFAULT_LOGO,
    brandHint: 'Walkmate',
    taglineHint: 'Step in Comfort • Everyday Walk & Travel Footwear',
    accentColorHint: '#0284C7',
    mediaTypeHint: 'banner' as const
  },
  {
    name: 'Yono Youth (Electric Purple)',
    url: YONO_DEFAULT_LOGO,
    brandHint: 'Yono',
    taglineHint: 'Youthful Energy • Modern Daily Stride & Trend',
    accentColorHint: '#7C3AED',
    mediaTypeHint: 'banner' as const
  },
  {
    name: 'Paragon (Royal Navy)',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240' width='240' height='240'><defs><linearGradient id='pbg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%231E3A8A'/><stop offset='100%25' stop-color='%23172554'/></linearGradient></defs><rect width='240' height='240' rx='48' fill='url(%23pbg)'/><path d='M60 60 H130 C160 60 180 75 180 105 C180 135 160 150 130 150 H95 V190 H60 V60 Z M95 90 V120 H125 C140 120 148 115 148 105 C148 95 140 90 125 90 H95 Z' fill='%23F59E0B'/><text x='120' y='215' text-anchor='middle' fill='%23FFFFFF' font-family='system-ui, -apple-system, sans-serif' font-weight='900' font-size='20' letter-spacing='2.5'>PARAGON</text></svg>",
    brandHint: 'Paragon',
    taglineHint: "India's Most Trusted Footwear • Genuine Quality",
    accentColorHint: '#1E3A8A',
    mediaTypeHint: 'banner' as const
  },
  {
    name: 'Sparx Active (Blaze Orange)',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240' width='240' height='240'><defs><linearGradient id='sbg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23EA580C'/><stop offset='100%25' stop-color='%239A3412'/></linearGradient></defs><rect width='240' height='240' rx='48' fill='url(%23sbg)'/><path d='M60 140 L110 70 L140 110 L180 60 L130 170 L100 130 Z' fill='%23FFFFFF'/><text x='120' y='212' text-anchor='middle' fill='%23FFFFFF' font-family='system-ui, -apple-system, sans-serif' font-weight='900' font-size='22' letter-spacing='3'>SPARX</text></svg>",
    brandHint: 'Sparx',
    taglineHint: 'Born For Action • High Performance Footwear',
    accentColorHint: '#EA580C',
    mediaTypeHint: 'video' as const
  },
  {
    name: 'Bairathi Luxury (Leather Brown)',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240' width='240' height='240'><defs><linearGradient id='bbg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%2378350F'/><stop offset='100%25' stop-color='%23451A03'/></linearGradient></defs><rect width='240' height='240' rx='48' fill='url(%23bbg)'/><circle cx='120' cy='95' r='45' fill='none' stroke='%23FBBF24' stroke-width='8'/><text x='120' y='108' text-anchor='middle' fill='%23FBBF24' font-family='serif' font-weight='900' font-size='38'>B</text><text x='120' y='185' text-anchor='middle' fill='%23FFFFFF' font-family='system-ui, -apple-system, sans-serif' font-weight='900' font-size='18' letter-spacing='3'>BAIRATHI</text><text x='120' y='205' text-anchor='middle' fill='%23FDE047' font-family='system-ui, -apple-system, sans-serif' font-weight='600' font-size='10' letter-spacing='1'>LUXURY FOOTWEAR</text></svg>",
    brandHint: 'Bairathi',
    taglineHint: 'Crafted Leather & Luxury Footwear • Official Partner',
    accentColorHint: '#92400E',
    mediaTypeHint: 'banner' as const
  },
  {
    name: 'Campus Shoes (Emerald Green)',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240' width='240' height='240'><defs><linearGradient id='cbg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23059669'/><stop offset='100%25' stop-color='%23064E3B'/></linearGradient></defs><rect width='240' height='240' rx='48' fill='url(%23cbg)'/><path d='M160 85 C145 65 110 65 85 85 C60 105 60 140 85 160 C110 180 145 180 160 160' fill='none' stroke='%2334D399' stroke-width='20' stroke-linecap='round'/><text x='120' y='212' text-anchor='middle' fill='%23FFFFFF' font-family='system-ui, -apple-system, sans-serif' font-weight='900' font-size='20' letter-spacing='3'>CAMPUS</text></svg>",
    brandHint: 'Campus',
    taglineHint: 'Young & Trendy Lifestyle Footwear',
    accentColorHint: '#059669',
    mediaTypeHint: 'banner' as const
  }
];

const BRAND_COLOR_PALETTES = [
  { name: 'Walkaroo Crimson', hex: '#BE123C' },
  { name: 'Indus Deep Teal', hex: '#0D9488' },
  { name: 'Walkmate Sky Blue', hex: '#0284C7' },
  { name: 'Yono Electric Violet', hex: '#7C3AED' },
  { name: 'Paragon Navy', hex: '#1E3A8A' },
  { name: 'Sparx Blaze Orange', hex: '#EA580C' },
  { name: 'Bairathi Leather Brown', hex: '#92400E' },
  { name: 'Campus Emerald', hex: '#059669' },
  { name: 'Action Racing Red', hex: '#B91C1C' },
  { name: 'Imperial Gold / Amber', hex: '#D97706' },
  { name: 'Deep Royal Purple', hex: '#7C3AED' },
  { name: 'Midnight Charcoal', hex: '#334155' }
];

const PRESET_BANNERS = [
  {
    name: 'Walkaroo Daily Comfort Sandals',
    url: WALKAROO_DEFAULT_BANNER,
    category: 'Daily Comfort'
  },
  {
    name: 'Indus PU Comfort & Slip-Ons',
    url: INDUS_DEFAULT_BANNER,
    category: 'PU Comfort'
  },
  {
    name: 'Walkmate Casual & Walk Footwear',
    url: WALKMATE_DEFAULT_BANNER,
    category: 'Daily Walk'
  },
  {
    name: 'Yono Youth Dynamic Sneakers',
    url: YONO_DEFAULT_BANNER,
    category: 'Trendy Sneakers'
  },
  {
    name: 'Classic Leather Sandals & Stride',
    url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=1200&auto=format&fit=crop&q=80',
    category: 'Formal Leather'
  },
  {
    name: 'Urban Athletic Sport Footwear',
    url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=80',
    category: 'Sports & Active'
  },
  {
    name: 'Casual Streetwear & Daily Slip-ons',
    url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=1200&auto=format&fit=crop&q=80',
    category: 'Casual Street'
  }
];

const SUGGESTED_TRUST_BADGES = [
  '100% Original Guarantee',
  '3 Months Sole Warranty',
  '6 Months Manufacturer Warranty',
  'All-Day Comfort Ergonomics',
  'Anti-Slip Traction Sole',
  'Direct Factory Authorized Dispatch',
  'ISO 9001 Certified Quality',
  'Free Replacement on Defects'
];

type ModalTab = 'identity' | 'logo' | 'banner' | 'guarantees' | 'preview' | 'delete';

export const BrandManagementSection: React.FC<BrandManagementSectionProps> = ({ theme = 'light' }) => {
  const isDark = theme === 'dark';
  const { brandConfigs, addBrandConfig, updateBrandConfig, deleteBrandConfig } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<ModalTab>('identity');
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');

  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Omit<BrandConfig, 'id'>>({
    brandName: '',
    tagline: '',
    logoUrl: WALKAROO_DEFAULT_LOGO,
    bannerUrl: WALKAROO_DEFAULT_BANNER,
    videoUrl: '',
    videoType: 'mp4',
    displayMediaType: 'banner',
    accentColor: '#BE123C',
    trustBadges: [
      '100% Original Walkaroo Guarantee',
      '3 Months of Only Sole Warranty',
      'All-Day Comfort – Comfortable for everyday wear.',
      'Quality Footwear – Made for reliable daily use.'
    ],
    description: '',
    officialWebsite: '',
    warrantyText: '3 Months of Only Sole Warranty against manufacturing defects',
    isVerifiedPartner: true,
  });

  const [badgeInput, setBadgeInput] = useState('');

  const handleOpenAddModal = () => {
    setEditingBrandId(null);
    setDeleteAcknowledged(false);
    setActiveModalTab('identity');
    setForm({
      brandName: '',
      tagline: '',
      logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4',
      videoType: 'mp4',
      displayMediaType: 'banner',
      accentColor: '#BE123C',
      trustBadges: [
        '100% Original Guarantee',
        'Factory Authorized Partner',
        '6 Months Warranty'
      ],
      description: 'Official manufacturer footwear crafted for high durability and daily ergonomic foot support.',
      officialWebsite: '',
      warrantyText: '6 Months Official Manufacturer Warranty',
      isVerifiedPartner: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (brand: BrandConfig, initialTab: ModalTab = 'identity') => {
    setEditingBrandId(brand.id);
    setDeleteAcknowledged(false);
    setActiveModalTab(initialTab);
    const resolvedColor = brand.accentColor || (
      brand.brandName.toLowerCase().includes('walkaroo') ? '#BE123C' :
      brand.brandName.toLowerCase().includes('indus') ? '#0D9488' :
      brand.brandName.toLowerCase().includes('walkmate') ? '#0284C7' :
      brand.brandName.toLowerCase().includes('yono') ? '#7C3AED' :
      brand.brandName.toLowerCase().includes('paragon') ? '#1E3A8A' :
      brand.brandName.toLowerCase().includes('sparx') ? '#EA580C' :
      brand.brandName.toLowerCase().includes('bairathi') ? '#92400E' :
      brand.brandName.toLowerCase().includes('campus') ? '#059669' :
      '#0D9488'
    );

    setForm({
      brandName: brand.brandName,
      tagline: brand.tagline || '',
      logoUrl: brand.logoUrl || '',
      bannerUrl: brand.bannerUrl || '',
      videoUrl: brand.videoUrl || '',
      videoType: brand.videoType || 'mp4',
      displayMediaType: brand.displayMediaType || (brand.bannerUrl ? 'banner' : (brand.videoUrl ? 'video' : 'none')),
      accentColor: resolvedColor,
      trustBadges: brand.trustBadges && brand.trustBadges.length > 0 ? [...brand.trustBadges] : [],
      description: brand.description || '',
      officialWebsite: brand.officialWebsite || '',
      warrantyText: brand.warrantyText || '',
      isVerifiedPartner: brand.isVerifiedPartner !== false,
    });
    setIsModalOpen(true);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, SVG, JPG, WEBP).');
      return;
    }

    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setForm(prev => ({ ...prev, logoUrl: result }));
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // Auto-fit to 100x100 square canvas with high quality
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Use 200x200 canvas for 2x retina display of 100x100
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          const scale = Math.min(200 / img.width, 200 / img.height);
          const nw = img.width * scale;
          const nh = img.height * scale;
          const ox = (200 - nw) / 2;
          const oy = (200 - nh) / 2;
          ctx.clearRect(0, 0, 200, 200);
          ctx.drawImage(img, ox, oy, nw, nh);
          const formattedDataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/webp', 0.95);
          setForm(prev => ({ ...prev, logoUrl: formattedDataUrl }));
        } else {
          setForm(prev => ({ ...prev, logoUrl: event.target?.result as string }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    // Format to 350x150 px ratio (700x300 for crisp 2x retina)
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 700; // 350 x 2 for 2x crispness
        canvas.height = 300; // 150 x 2 for 2x crispness
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          // Cover 350:150 (7:3)
          const scale = Math.max(700 / img.width, 300 / img.height);
          const nw = img.width * scale;
          const nh = img.height * scale;
          const ox = (700 - nw) / 2;
          const oy = (300 - nh) / 2;
          ctx.clearRect(0, 0, 700, 300);
          ctx.drawImage(img, ox, oy, nw, nh);
          const formattedDataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92);
          setForm(prev => ({ ...prev, bannerUrl: formattedDataUrl }));
        } else {
          setForm(prev => ({ ...prev, bannerUrl: event.target?.result as string }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddBadge = (text?: string) => {
    const badgeToAdd = (text || badgeInput).trim();
    if (!badgeToAdd) return;
    if (form.trustBadges.includes(badgeToAdd)) return;

    setForm(prev => ({
      ...prev,
      trustBadges: [...prev.trustBadges, badgeToAdd]
    }));
    if (!text) setBadgeInput('');
  };

  const handleRemoveBadge = (index: number) => {
    setForm(prev => ({
      ...prev,
      trustBadges: prev.trustBadges.filter((_, idx) => idx !== index)
    }));
  };

  const handleSaveBrand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.brandName.trim()) {
      setErrorMsg('Brand name is required.');
      setActiveModalTab('identity');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      if (editingBrandId) {
        const res = await updateBrandConfig(editingBrandId, form);
        if (res.success) {
          setSuccessMsg(`Brand "${form.brandName}" logo, banner & details saved to database successfully!`);
          setIsModalOpen(false);
        } else {
          setErrorMsg(res.error || 'Failed to update brand in database.');
        }
      } else {
        const res = await addBrandConfig(form);
        if (res.success) {
          setSuccessMsg(`Brand "${form.brandName}" created & saved to database successfully!`);
          setIsModalOpen(false);
        } else {
          setErrorMsg(res.error || 'Failed to save brand to database.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || String(err));
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  const handleDeleteBrand = async (id: string, name: string) => {
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      const res = await deleteBrandConfig(id);
      if (res && res.success) {
        setSuccessMsg(`Brand "${name}" has been permanently deleted from database.`);
        setIsModalOpen(false);
        setEditingBrandId(null);
        setDeleteAcknowledged(false);
      } else {
        setErrorMsg(res?.error || `Failed to delete brand "${name}".`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || String(err));
    } finally {
      setIsDeleting(false);
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Console Executive Header */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden transition-all shadow-sm ${
        isDark ? 'bg-zinc-950/80 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25 flex items-center gap-1.5">
                <Sparkles size={11} className="text-amber-500" /> BRAND REGISTRY & SHOWCASE
              </span>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 size={10} /> Live Storefront Sync
              </span>
            </div>

            <h1 className="serif-display text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Brand Management Console
            </h1>
          </div>

          {/* Header Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-black text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 border border-amber-600/30"
            >
              <Plus size={18} strokeWidth={3} className="text-zinc-950" />
              <span>Add New Brand</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-400 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Brand Grid Showcase */}
      {brandConfigs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {brandConfigs.map((brand) => {
            const brandColor = brand.accentColor || (
              brand.brandName.toLowerCase().includes('walkaroo') ? '#BE123C' :
              brand.brandName.toLowerCase().includes('paragon') ? '#1E3A8A' :
              brand.brandName.toLowerCase().includes('sparx') ? '#EA580C' :
              brand.brandName.toLowerCase().includes('bairathi') ? '#92400E' :
              brand.brandName.toLowerCase().includes('campus') ? '#059669' :
              '#BE123C'
            );

            const mediaMode = brand.displayMediaType || (brand.bannerUrl ? 'banner' : (brand.videoUrl ? 'video' : 'none'));

            return (
              <div
                key={brand.id}
                className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-300 group hover:shadow-xl ${
                  isDark ? 'bg-zinc-950/70 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
                }`}
              >
                {/* Brand Banner Container (350 x 150 Px, 7:3 Ratio) - Clean, Unobstructed */}
                <div className="relative aspect-[350/150] w-full bg-zinc-950 overflow-hidden">
                  {brand.bannerUrl ? (
                    <img
                      src={brand.bannerUrl}
                      alt={brand.brandName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 font-mono text-xs gap-1">
                      <ImageIcon size={24} className="opacity-40" />
                      <span>No 350 × 150 Banner Set</span>
                    </div>
                  )}

                  {/* Top Floating Badge Strip */}
                  {brand.isVerifiedPartner !== false && (
                    <div className="absolute top-2.5 left-2.5 pointer-events-none">
                      <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500 text-black px-2.5 py-0.5 rounded-full font-mono font-black uppercase tracking-wider shadow-sm">
                        <CheckCircle2 size={10} /> Verified Partner
                      </span>
                    </div>
                  )}
                </div>

                {/* Brand Header Bar: Logo, Name & Status below the Banner */}
                <div className={`px-5 py-3.5 border-b flex items-center justify-between gap-3 ${
                  isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50/80 border-zinc-100'
                }`}>
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Logo Thumbnail (100x100 Ratio) */}
                    <div 
                      className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden border border-zinc-200 dark:border-zinc-700 cursor-pointer group-hover:scale-105 transition-transform"
                      onClick={() => handleOpenEditModal(brand, 'logo')}
                      title="100 × 100 Px Logo - Click to Edit"
                    >
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          alt={brand.brandName}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="font-mono font-black text-xs text-zinc-900">
                          {brand.brandName.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="serif-display text-sm sm:text-base font-black uppercase tracking-tight truncate" style={{ color: brandColor }}>
                          {brand.brandName}
                        </h2>
                      </div>
                      <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 truncate font-sans font-medium">
                        {brand.tagline || 'Authorized Brand Partner'}
                      </p>
                    </div>
                  </div>

                  {/* Accent Color Circle Indicator */}
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 border-white/80 shrink-0 shadow-xs"
                    style={{ backgroundColor: brandColor }}
                    title={`Brand Accent Theme: ${brandColor}`}
                  />
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Brand Craft Story */}
                    <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {brand.description || 'Official partner footwear crafted for high durability, all-day ergonomics, and genuine customer value.'}
                    </p>

                    {/* Trust Badges Showcase */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase font-bold">
                        <span>Trust Guarantees</span>
                        <span>{brand.trustBadges?.length || 0} badges</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(brand.trustBadges || []).slice(0, 3).map((badge, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                              isDark 
                                ? 'bg-zinc-900 border-zinc-800 text-zinc-300' 
                                : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                            }`}
                          >
                            <ShieldCheck size={11} style={{ color: brandColor }} className="shrink-0" />
                            <span className="truncate max-w-[150px]">{badge}</span>
                          </span>
                        ))}
                        {(brand.trustBadges?.length || 0) > 3 && (
                          <span className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.5">
                            +{(brand.trustBadges?.length || 0) - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Warranty Indicator */}
                    {brand.warrantyText && (
                      <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
                        isDark ? 'bg-zinc-900/40 border-zinc-800/80 text-zinc-300' : 'bg-amber-50/50 border-amber-200/60 text-amber-900'
                      }`}>
                        <Award size={13} style={{ color: brandColor }} className="shrink-0" />
                        <span className="truncate font-medium">{brand.warrantyText}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-4 border-t border-zinc-800/20 dark:border-zinc-800/60 flex items-center justify-between gap-2">
                    {/* Official Link */}
                    {brand.officialWebsite ? (
                      <a
                        href={brand.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono font-bold inline-flex items-center gap-1 hover:underline text-amber-500"
                      >
                        <span>Official Website</span>
                        <ArrowUpRight size={12} />
                      </a>
                    ) : (
                      <span className="text-[11px] font-mono text-zinc-500">No Web Link</span>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(brand, 'identity')}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 border border-amber-600/30"
                        title="Edit brand settings, logo & banner"
                      >
                        <Edit3 size={13} strokeWidth={2.5} />
                        <span>Edit Brand</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className={`p-12 text-center rounded-3xl border space-y-4 max-w-lg mx-auto ${
          isDark ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
            <Layers size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="serif-display text-lg font-bold uppercase text-zinc-900 dark:text-white">
              No brands registered yet
            </h3>
            <p className="text-xs">Click the "Add New Brand" button above to configure your first footwear brand identity.</p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-amber-500 text-black hover:bg-amber-400 cursor-pointer"
          >
            + Add New Brand
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REDESIGNED TABBED EDIT / ADD BRAND MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans animate-fade-in">
          <div className={`max-w-4xl w-full rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800/20 dark:border-zinc-800/60 flex items-center justify-between gap-4 bg-zinc-900/10 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3 min-w-0">
                <div 
                  className="w-10 h-10 rounded-2xl p-1 bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-sm overflow-hidden"
                >
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="font-mono font-black text-sm text-zinc-900">
                      {form.brandName?.slice(0, 2).toUpperCase() || 'BR'}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full border border-black/20 shrink-0" 
                      style={{ backgroundColor: form.accentColor || '#BE123C' }} 
                    />
                    <h2 className="serif-display text-base sm:text-lg font-black uppercase tracking-tight truncate">
                      {editingBrandId ? `Edit Brand: ${form.brandName || 'Untitled'}` : 'Add New Brand'}
                    </h2>
                    {form.isVerifiedPartner && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                        <CheckCircle2 size={10} /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {activeModalTab === 'identity' ? '1. Brand Identity, Name, Tagline & Theme Color' :
                     activeModalTab === 'logo' ? '2. Brand Logo Emblem (100 × 100 Px Frame)' :
                     activeModalTab === 'banner' ? '3. Hero Banner (350 × 150 Px) & Media Modes' :
                     activeModalTab === 'guarantees' ? '4. Authenticity Badges, Warranty & Story' :
                     activeModalTab === 'preview' ? '5. Customer Storefront Live Simulation' :
                     '6. Danger Zone • Permanently Delete Brand'}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Top Bar Options / Navigation Tabs */}
            <div className="p-2.5 sm:p-3.5 border-b border-zinc-200/90 dark:border-zinc-800/90 bg-zinc-100/95 dark:bg-zinc-900/95 backdrop-blur-md">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none sm:grid sm:grid-cols-6">
                {[
                  { id: 'identity' as ModalTab, step: '1', label: '1. Identity', sublabel: 'Name & Color', icon: Palette },
                  { id: 'logo' as ModalTab, step: '2', label: '2. Brand Logo', sublabel: '100 × 100 Px', icon: Sparkles },
                  { id: 'banner' as ModalTab, step: '3', label: '3. Hero Banner', sublabel: '350 × 150 Px', icon: ImageIcon },
                  { 
                    id: 'guarantees' as ModalTab, 
                    step: '4', 
                    label: '4. Badges', 
                    sublabel: 'Trust & Warranty', 
                    icon: ShieldCheck, 
                    count: form.trustBadges.length 
                  },
                  { id: 'preview' as ModalTab, step: '5', label: '5. Preview', sublabel: 'Storefront View', icon: Eye },
                  { id: 'delete' as ModalTab, step: '6', label: '6. Delete Brand', sublabel: 'Danger Zone', icon: Trash2, isDanger: true },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeModalTab === tab.id;
                  const isDanger = (tab as any).isDanger;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveModalTab(tab.id)}
                      className={`group relative p-2.5 sm:p-3 rounded-2xl text-left transition-all duration-200 cursor-pointer flex items-center gap-2.5 border shrink-0 min-w-[145px] sm:min-w-0 ${
                        isActive
                          ? isDanger
                            ? 'bg-rose-600 text-white border-rose-500 shadow-md ring-2 ring-rose-500/30'
                            : 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md ring-2 ring-amber-500/20'
                          : isDanger
                            ? 'bg-rose-500/10 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:border-rose-500 hover:bg-rose-500/20'
                            : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/60 hover:bg-amber-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {/* Step Number & Icon */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isActive
                          ? isDanger
                            ? 'bg-zinc-950 text-rose-400 shadow-xs'
                            : 'bg-zinc-950 text-amber-400 shadow-xs'
                          : isDanger
                            ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-amber-500'
                      }`}>
                        <Icon size={16} />
                      </div>

                      {/* Label & Description */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-mono font-black tracking-tight truncate block ${
                            isActive 
                              ? isDanger ? 'text-white font-black' : 'text-zinc-950 font-black' 
                              : isDanger ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-zinc-850 dark:text-zinc-200 font-bold'
                          }`}>
                            {tab.label}
                          </span>
                          {tab.count !== undefined && tab.count > 0 && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-black shrink-0 ${
                              isActive ? 'bg-zinc-950 text-amber-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            }`}>
                              {tab.count}
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-sans truncate block leading-tight mt-0.5 ${
                          isActive 
                            ? isDanger ? 'text-white/90 font-medium' : 'text-zinc-950/80 font-medium' 
                            : isDanger ? 'text-rose-500 dark:text-rose-400/80' : 'text-zinc-500 dark:text-zinc-400'
                        }`}>
                          {tab.sublabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Body with Form & Live Preview */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-mono font-bold flex items-center gap-2">
                  <X size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* TAB 1: IDENTITY & COLORS */}
              {activeModalTab === 'identity' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase font-black text-zinc-500 block">
                        Brand Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.brandName}
                        onChange={e => setForm({ ...form, brandName: e.target.value })}
                        placeholder="e.g. Walkaroo, Paragon, Sparx, Campus, Action"
                        className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold ${
                          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase font-black text-zinc-500 block">
                        Brand Slogan / Tagline
                      </label>
                      <input
                        type="text"
                        value={form.tagline}
                        onChange={e => setForm({ ...form, tagline: e.target.value })}
                        placeholder="e.g. Be Restless"
                        className={`w-full px-4 py-3 rounded-2xl border text-sm ${
                          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Brand Color Picker and Swatches */}
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
                    isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Palette size={16} className="text-amber-500" />
                        <div>
                          <h3 className="text-xs font-mono font-bold uppercase">Brand Theme & Accent Color</h3>
                          <p className="text-[11px] text-zinc-500">Colors buttons, badges, and trust icons in storefront product pages.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold">{form.accentColor || '#BE123C'}</span>
                        <input
                          type="color"
                          value={form.accentColor || '#BE123C'}
                          onChange={e => setForm({ ...form, accentColor: e.target.value })}
                          className="w-8 h-8 rounded-xl cursor-pointer border border-zinc-300 dark:border-zinc-700 bg-transparent p-0.5"
                          title="Pick custom color"
                        />
                      </div>
                    </div>

                    {/* Preset Swatches */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                        Popular Footwear Brand Color Swatches:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {BRAND_COLOR_PALETTES.map((palette, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, accentColor: palette.hex }))}
                            className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-2.5 cursor-pointer text-left ${
                              (form.accentColor || '').toLowerCase() === palette.hex.toLowerCase()
                                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-amber-500 shadow-sm'
                                : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700' : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: palette.hex }} />
                            <span className="truncate">{palette.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Official Website & Verified Store Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase font-black text-zinc-500 block">
                        Official Brand Website (Optional)
                      </label>
                      <input
                        type="url"
                        value={form.officialWebsite}
                        onChange={e => setForm({ ...form, officialWebsite: e.target.value })}
                        placeholder="https://www.walkaroo.in"
                        className={`w-full px-4 py-3 rounded-2xl border text-xs font-mono ${
                          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                    </div>

                    <div className="flex items-center pt-6">
                      <label className={`p-3.5 rounded-2xl border flex items-center gap-3 w-full cursor-pointer transition-colors ${
                        form.isVerifiedPartner
                          ? isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                      }`}>
                        <input
                          type="checkbox"
                          checked={form.isVerifiedPartner}
                          onChange={e => setForm({ ...form, isVerifiedPartner: e.target.checked })}
                          className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold block">Verified Brand Partner</span>
                          <span className="text-[10px] text-zinc-500 block">Displays verified green seal in product modal</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Bottom Navigation for Identity */}
                  <div className="flex items-center justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('logo')}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <span>Next: 2. Brand Logo (100 × 100)</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: BRAND LOGO (100 X 100 PX DEDICATED EDITOR) */}
              {activeModalTab === 'logo' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    {/* Logo Active Preview Box - Exactly 100x100 frame preview */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl border text-center space-y-3 bg-zinc-900/40 border-zinc-800">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 font-black tracking-wider">Logo Frame</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                          100 × 100 Px (1:1)
                        </span>
                      </div>
                      
                      {/* Fixed 100x100 visual box with subtle checkerboard backdrop for transparent PNGs */}
                      <div 
                        className="w-[100px] h-[100px] rounded-2xl bg-white p-2 border-2 border-amber-500 flex items-center justify-center shadow-xl overflow-hidden relative"
                        style={{
                          backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
                          backgroundSize: '8px 8px'
                        }}
                      >
                        {form.logoUrl ? (
                          <img
                            src={form.logoUrl}
                            alt="Logo preview"
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-zinc-400 font-mono text-[10px] font-bold">
                            <Sparkles size={16} className="text-amber-500 mb-1" />
                            <span>100 × 100</span>
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-zinc-400 max-w-[220px]">
                        Exact 1:1 square ratio. Scaled smoothly for product header and brand seal.
                      </p>

                      <div className="flex items-center gap-2">
                        {form.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, logoUrl: '' })}
                            className="text-[11px] font-mono font-bold text-rose-500 hover:underline cursor-pointer"
                          >
                            Remove Logo
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Logo Upload & URL Options */}
                    <div className="md:col-span-7 space-y-4">
                      {/* Upload Box */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-mono font-bold uppercase text-zinc-500 block">
                            Upload 100 × 100 Px Logo
                          </label>
                          <span className="text-[10px] font-mono text-zinc-400">PNG (Transparent), SVG, WEBP, JPG</span>
                        </div>
                        <input
                          ref={logoFileInputRef}
                          type="file"
                          accept="image/png, image/jpeg, image/webp, image/svg+xml"
                          onChange={handleLogoFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => logoFileInputRef.current?.click()}
                          className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-zinc-400/40 hover:border-amber-500 bg-zinc-500/5 hover:bg-amber-500/5 transition-all cursor-pointer flex items-center justify-center gap-3 text-xs font-mono font-bold"
                        >
                          <Upload size={16} className="text-amber-500" />
                          <span>Click to Upload 100 × 100 Px Logo File</span>
                        </button>
                      </div>

                      {/* URL Box */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-bold uppercase text-zinc-500 block">
                          Or Paste Logo Image URL / SVG Data URI
                        </label>
                        <div className="relative">
                          <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input
                            type="text"
                            value={form.logoUrl}
                            onChange={e => setForm({ ...form, logoUrl: e.target.value })}
                            placeholder="https://... or data:image/svg+xml..."
                            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs font-mono ${
                              isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-sans text-amber-700 dark:text-amber-300">
                        💡 <strong>Dimensions Note:</strong> Logos are automatically formatted to fit a crisp <strong>100 × 100 px</strong> container with retina supersampling.
                      </div>
                    </div>
                  </div>

                  {/* One-Click Presets */}
                  <div className={`p-4 sm:p-5 rounded-3xl border space-y-3 ${
                    isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-500" />
                      <h4 className="text-xs font-mono font-bold uppercase">One-Click 100 × 100 Px Brand Logo Presets</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {PRESET_BRAND_LOGOS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setForm(prev => ({
                              ...prev,
                              logoUrl: preset.url,
                              brandName: prev.brandName || preset.brandHint,
                              tagline: prev.tagline || preset.taglineHint,
                              accentColor: preset.accentColorHint || prev.accentColor,
                              displayMediaType: preset.mediaTypeHint || prev.displayMediaType
                            }));
                          }}
                          className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer text-left ${
                            form.logoUrl === preset.url
                              ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-amber-500 shadow-sm'
                              : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700' : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-zinc-200 overflow-hidden">
                            <img src={preset.url} alt={preset.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-mono font-bold block truncate">{preset.name}</span>
                            <span className="text-[10px] text-zinc-500 block truncate">{preset.taglineHint}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Navigation for Logo */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('identity')}
                      className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                    >
                      <ArrowLeft size={14} />
                      <span>Previous: 1. Identity</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveModalTab('banner')}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <span>Next: 3. Hero Banner (350 × 150)</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: HERO BANNER (350 X 150 PX DEDICATED EDITOR) */}
              {activeModalTab === 'banner' && (
                <div className="space-y-5 animate-fade-in">

                  {/* Media Mode Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold uppercase text-zinc-500 block">
                      Customer Media Placement Mode (Select how brand media is shown)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, displayMediaType: 'banner' }))}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          (form.displayMediaType || 'banner') === 'banner'
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-amber-500 shadow-md font-bold'
                            : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                        }`}
                      >
                        <ImageIcon size={20} className="text-amber-500" />
                        <span className="text-xs font-mono uppercase">350 × 150 Px Hero Banner</span>
                        <span className="text-[10px] text-zinc-500">Displays brand hero artwork</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, displayMediaType: 'video' }))}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          form.displayMediaType === 'video'
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-amber-500 shadow-md font-bold'
                            : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                        }`}
                      >
                        <Tv size={20} className="text-blue-500" />
                        <span className="text-xs font-mono uppercase">Brand Video Commercial</span>
                        <span className="text-[10px] text-zinc-500">Plays video promo in modal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, displayMediaType: 'none' }))}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          form.displayMediaType === 'none'
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-amber-500 shadow-md font-bold'
                            : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                        }`}
                      >
                        <X size={20} className="text-zinc-500" />
                        <span className="text-xs font-mono uppercase">No Media (Text Only)</span>
                        <span className="text-[10px] text-zinc-500">Compact trust badges card</span>
                      </button>
                    </div>
                  </div>

                  {/* Banner Photo Section (350 x 150 Px) */}
                  {form.displayMediaType !== 'video' && (
                    <div className="space-y-4">
                      {/* Banner Dimension Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon size={15} className="text-amber-500" />
                          <span className="text-xs font-mono uppercase font-bold text-zinc-900 dark:text-white">
                            350 × 150 Px Hero Banner Canvas
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                          350 × 150 Px (7:3 Ratio)
                        </span>
                      </div>

                      {/* Banner Preview Frame formatted exactly at 350x150 aspect ratio */}
                      <div className="relative aspect-[350/150] w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner">
                        {form.bannerUrl ? (
                          <img
                            src={form.bannerUrl}
                            alt="350x150 Banner preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 font-mono text-xs gap-1.5 p-4 text-center">
                            <ImageIcon size={28} className="opacity-40" />
                            <span className="font-bold">No 350 × 150 Px Banner Uploaded</span>
                            <span className="text-[10px] text-zinc-500">Upload a 350 × 150 Px image to showcase official footwear artwork</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 sm:p-4 flex items-end justify-between">
                          <div className="min-w-0">
                            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block truncate">
                              {form.brandName || 'Brand Name'} • {form.tagline || 'Official Banner'}
                            </span>
                            <span className="text-[9px] font-mono text-amber-400 block">
                              350 × 150 Px Active
                            </span>
                          </div>
                          {form.bannerUrl && (
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, bannerUrl: '' })}
                              className="text-[10px] font-mono font-bold text-rose-400 hover:underline bg-black/70 px-2.5 py-1 rounded-lg border border-white/10"
                            >
                              Clear Banner
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Banner Upload / URL Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-5">
                          <input
                            ref={bannerFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleBannerFileUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => bannerFileInputRef.current?.click()}
                            className="w-full py-3 px-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-xs font-mono font-bold flex items-center justify-center gap-2 hover:border-amber-500 cursor-pointer shadow-xs"
                          >
                            <Upload size={14} className="text-amber-500" />
                            <span>Upload 350 × 150 Px Banner</span>
                          </button>
                        </div>

                        <div className="sm:col-span-7">
                          <input
                            type="text"
                            value={form.bannerUrl}
                            onChange={e => setForm({ ...form, bannerUrl: e.target.value })}
                            placeholder="Or paste 350 × 150 Px Banner Image URL..."
                            className={`w-full px-3 py-3 rounded-2xl border text-xs font-mono ${
                              isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-sans text-amber-700 dark:text-amber-300">
                        💡 <strong>Dimensions Note:</strong> Banners are tailored for <strong>350 × 150 px</strong> (7:3 ratio). Uploaded banner photos are automatically adapted to 350 × 150 px with 2x crispness.
                      </div>

                      {/* Preset Banners */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                          350 × 150 Px Footwear Banner Presets:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {PRESET_BANNERS.map((bannerPreset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, bannerUrl: bannerPreset.url }))}
                              className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center justify-between gap-2 cursor-pointer text-left ${
                                form.bannerUrl === bannerPreset.url
                                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-amber-500 shadow-xs'
                                  : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'
                              }`}
                            >
                              <span className="truncate">{bannerPreset.name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 shrink-0">
                                {bannerPreset.category}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Video Ad Section */}
                  {(form.displayMediaType === 'video' || form.videoUrl) && (
                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-mono font-bold uppercase text-zinc-500 block">
                        Brand Promo Video Commercial URL (MP4 Video or YouTube Link)
                      </label>
                      <input
                        type="text"
                        value={form.videoUrl}
                        onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                        placeholder="e.g. https://assets.mixkit.co/...mp4 or https://youtube.com/watch?v=..."
                        className={`w-full px-4 py-3 rounded-2xl border text-xs font-mono ${
                          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                    </div>
                  )}

                  {/* Bottom Navigation for Banner */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('logo')}
                      className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                    >
                      <ArrowLeft size={14} />
                      <span>Previous: 2. Logo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveModalTab('guarantees')}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <span>Next: 4. Badges & Warranty</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: TRUST BADGES, WARRANTY & STORY */}
              {activeModalTab === 'guarantees' && (
                <div className="space-y-5 animate-fade-in">
                  {/* Trust Badges Tag Manager */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold uppercase text-zinc-500">
                        Trust Badges & Guarantees ({form.trustBadges.length})
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={badgeInput}
                        onChange={e => setBadgeInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddBadge(); } }}
                        placeholder="Type custom guarantee (e.g. 100% Original Walkaroo Guarantee)..."
                        className={`flex-1 px-3.5 py-2.5 rounded-2xl border text-xs ${
                          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddBadge()}
                        className="px-4 py-2.5 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-mono font-bold text-xs uppercase cursor-pointer"
                      >
                        Add Badge
                      </button>
                    </div>

                    {/* Active Badges List */}
                    <div className="flex flex-wrap gap-1.5">
                      {form.trustBadges.map((badge, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-medium px-3 py-1.5 rounded-xl border flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                        >
                          <ShieldCheck size={13} style={{ color: form.accentColor || '#BE123C' }} />
                          <span>{badge}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBadge(idx)}
                            className="text-rose-500 hover:text-rose-400 ml-1 cursor-pointer"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Suggested Badges */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                        Quick Add Suggested Footwear Guarantees:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {SUGGESTED_TRUST_BADGES.map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAddBadge(sug)}
                            disabled={form.trustBadges.includes(sug)}
                            className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              form.trustBadges.includes(sug)
                                ? 'opacity-40 cursor-not-allowed bg-zinc-200 dark:bg-zinc-800'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                            }`}
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Warranty Text */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase font-black text-zinc-500 block">
                      Warranty Statement
                    </label>
                    <input
                      type="text"
                      value={form.warrantyText}
                      onChange={e => setForm({ ...form, warrantyText: e.target.value })}
                      placeholder="e.g. 3 Months of Only Sole Warranty against manufacturing defects"
                      className={`w-full px-4 py-3 rounded-2xl border text-xs ${
                        isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                      }`}
                    />
                  </div>

                  {/* Craft Story Description */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase font-black text-zinc-500 block">
                      Brand Craft Story & Heritage Description
                    </label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe footbed ergonomic comfort, high quality materials, durability and craftsmanship..."
                      className={`w-full px-4 py-3 rounded-2xl border text-xs leading-relaxed ${
                        isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                      }`}
                    />
                  </div>

                  {/* Bottom Navigation for Guarantees */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('banner')}
                      className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                    >
                      <ArrowLeft size={14} />
                      <span>Previous: 3. Banner</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveModalTab('preview')}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <span>Next: 5. Storefront Preview</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: LIVE STOREFRONT PREVIEW */}
              {activeModalTab === 'preview' && (
                <div className="space-y-5 animate-fade-in">
                  <div className={`p-4 sm:p-5 rounded-3xl border space-y-3 ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <span className="flex items-center gap-1.5 text-amber-500 uppercase">
                        <Eye size={13} /> Live Customer Storefront Preview Simulation
                      </span>
                      <div className="flex items-center gap-1 bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setPreviewTheme('light')}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${
                            previewTheme === 'light' ? 'bg-white text-black shadow-xs' : 'text-zinc-500'
                          }`}
                        >
                          Light
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewTheme('dark')}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${
                            previewTheme === 'dark' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-500'
                          }`}
                        >
                          Dark
                        </button>
                      </div>
                    </div>

                    {/* Simulated Storefront Card */}
                    <div className={`p-4 rounded-2xl border space-y-3 transition-colors ${
                      previewTheme === 'dark' ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 border border-zinc-200 overflow-hidden shadow-xs">
                          {form.logoUrl ? (
                            <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="font-mono font-black text-xs text-zinc-900">
                              {form.brandName?.slice(0, 2).toUpperCase() || 'BR'}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold uppercase tracking-wide truncate" style={{ color: form.accentColor || '#BE123C' }}>
                              {form.brandName || 'Brand Name'}
                            </span>
                            {form.isVerifiedPartner && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-black shrink-0">
                                <CheckCircle2 size={10} /> Verified Partner
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 truncate">
                            {form.tagline || 'Be Restless'}
                          </p>
                        </div>
                      </div>

                      {form.displayMediaType === 'banner' && form.bannerUrl && (
                        <div className="relative aspect-[350/150] w-full rounded-xl overflow-hidden border border-zinc-800/40">
                          <img src={form.bannerUrl} alt="Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-white/90 border border-white/10">
                            350 × 150 Px
                          </div>
                        </div>
                      )}

                      {/* Trust Badges */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {form.trustBadges.slice(0, 2).map((badge, idx) => (
                          <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center gap-1">
                            <ShieldCheck size={11} style={{ color: form.accentColor || '#BE123C' }} />
                            <span className="truncate max-w-[200px]">{badge}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation for Preview */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('guarantees')}
                      className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                    >
                      <ArrowLeft size={14} />
                      <span>Previous: 4. Badges & Warranty</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {editingBrandId && (
                        <button
                          type="button"
                          onClick={() => setActiveModalTab('delete')}
                          className="px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Trash2 size={13} />
                          <span>6. Delete Brand</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSaveBrand()}
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-black flex items-center gap-2 cursor-pointer shadow-sm transition-all uppercase tracking-wider"
                      >
                        <Save size={14} />
                        <span>Save Brand</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: DANGER ZONE - DELETE BRAND PERMANENTLY */}
              {activeModalTab === 'delete' && (
                <div className="space-y-6 animate-fade-in">
                  <div className={`p-6 sm:p-8 rounded-3xl border ${
                    isDark ? 'bg-rose-950/20 border-rose-900/40 text-white' : 'bg-rose-50/70 border-rose-200 text-zinc-900'
                  }`}>
                    {/* Header Warning */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-sm">
                        <AlertTriangle size={24} />
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                            06 • Danger Zone
                          </span>
                        </div>
                        <h3 className="serif-display text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                          Delete Brand Permanently
                        </h3>
                        <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                          Deleting this brand will permanently remove its configuration, logo, banners, and trust guarantees from the cloud database.
                        </p>
                      </div>
                    </div>

                    {/* Brand Card Summary */}
                    <div className={`mt-6 p-4.5 rounded-2xl border flex items-center gap-4 ${
                      isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-rose-100 shadow-sm'
                    }`}>
                      <div className="w-14 h-14 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 border border-zinc-200 shadow-xs overflow-hidden">
                        {form.logoUrl ? (
                          <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="font-mono font-black text-sm text-zinc-900">{form.brandName?.slice(0, 2).toUpperCase() || 'BR'}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: form.accentColor || '#BE123C' }} />
                          <h4 className="text-base font-black truncate" style={{ color: form.accentColor || '#BE123C' }}>
                            {form.brandName || 'Untitled Brand'}
                          </h4>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          {form.tagline || 'No tagline configured'}
                        </p>
                        {editingBrandId && (
                          <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 mt-1">
                            Database ID: {editingBrandId}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Warnings & Consequences */}
                    <div className={`mt-6 p-5 rounded-2xl border space-y-3 ${
                      isDark ? 'bg-zinc-900/50 border-rose-900/30' : 'bg-rose-100/50 border-rose-200'
                    }`}>
                      <p className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide flex items-center gap-1.5">
                        <AlertTriangle size={14} /> Please Read Carefully Before Proceeding:
                      </p>
                      <ul className={`text-xs space-y-1.5 list-disc list-inside leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        <li>This action <strong>CANNOT</strong> be undone. The brand configuration will be permanently purged from Firestore.</li>
                        <li>Custom banners, logos, trust guarantee badges, and warranty statements will be wiped.</li>
                        <li>Products associated with this brand in catalog will remain, but will no longer feature custom branded badges or banners.</li>
                      </ul>
                    </div>

                    {/* Acknowledgement Checkbox */}
                    {editingBrandId && (
                      <div className="mt-6">
                        <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer select-none transition-all ${
                          deleteAcknowledged
                            ? 'bg-rose-500/15 border-rose-500/50 shadow-sm'
                            : isDark ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'
                        }`}>
                          <input
                            type="checkbox"
                            checked={deleteAcknowledged}
                            onChange={(e) => setDeleteAcknowledged(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer"
                          />
                          <span className={`text-xs leading-relaxed ${
                            deleteAcknowledged
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : isDark ? 'text-zinc-300' : 'text-zinc-700'
                          }`}>
                            I acknowledge and confirm that I want to permanently delete <strong>"{form.brandName || 'this brand'}"</strong> and understand all brand assets and guarantees will be completely removed.
                          </span>
                        </label>
                      </div>
                    )}

                    {/* Action Area */}
                    <div className="mt-8 pt-6 border-t border-rose-200 dark:border-rose-900/40 flex flex-wrap items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => setActiveModalTab('preview')}
                        className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                      >
                        <ArrowLeft size={14} />
                        <span>Previous: 5. Storefront Preview</span>
                      </button>

                      {editingBrandId ? (
                        <button
                          type="button"
                          disabled={isDeleting || !deleteAcknowledged}
                          onClick={() => handleDeleteBrand(editingBrandId, form.brandName)}
                          className={`px-6 py-3 rounded-2xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
                            deleteAcknowledged && !isDeleting
                              ? 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white cursor-pointer shadow-lg shadow-rose-600/30 border border-rose-500'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-300 dark:border-zinc-700 cursor-not-allowed opacity-60'
                          }`}
                        >
                          {isDeleting ? (
                            <>
                              <RefreshCw size={16} className="animate-spin text-white" />
                              <span>Deleting from Database...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 size={16} />
                              <span>Delete Brand Permanently</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="text-xs font-mono text-zinc-500 italic">
                          This brand is not yet saved to the database. You can click "Cancel" at the bottom to discard it.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-5 sm:p-6 border-t border-zinc-800/20 dark:border-zinc-800/60 flex flex-wrap items-center justify-between gap-3 bg-zinc-900/10 dark:bg-zinc-900/50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-mono font-bold uppercase cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
                  <Database size={11} /> Cloud Database Synced
                </span>

                <button
                  type="button"
                  onClick={() => handleSaveBrand()}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-black text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center gap-2 shadow-lg hover:shadow-amber-500/20 border border-amber-600/30"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>Save Brand to Database</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
