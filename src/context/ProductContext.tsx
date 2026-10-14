import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDocs, query, where } from 'firebase/firestore';
import { Product, Order, HeroVideo, HeroImage, StockLedger, BrandConfig } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import { useAuth } from './AuthContext';
import { saveVideoBlob, getVideoBlob, clearVideoBlob, saveMediaItem, getMediaItem, clearMediaItem } from '../utils/videoStorage';
import { compressImage } from '../utils/imageCompressor';

// Safe localStorage helper that avoids throwing quota exceeded errors on large payloads
export const safeLocalStorageSet = (key: string, value: string): boolean => {
  try {
    if (!value || typeof value !== 'string') {
      localStorage.removeItem(key);
      return true;
    }
    // Prevent browser LocalStorage quota overflow with large Base64 / video payloads
    if (value.length > 250000) {
      return false;
    }
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`LocalStorage setItem skipped for "${key}" (storage quota):`, e);
    return false;
  }
};

export const WALKAROO_DEFAULT_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 48' width='180' height='48'><defs><linearGradient id='wbg' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='%23E11D48'/><stop offset='100%' stop-color='%23BE123C'/></linearGradient></defs><rect width='180' height='48' rx='10' fill='url(%23wbg)'/><circle cx='28' cy='24' r='14' fill='%23FFFFFF'/><path d='M20 27 L25 18 L28 23 L32 18 L36 27' fill='none' stroke='%23BE123C' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/><circle cx='28' cy='15' r='2' fill='%23FBBF24'/><text x='104' y='32' text-anchor='middle' fill='%23FFFFFF' font-family='Arial, Helvetica, sans-serif' font-weight='900' font-size='21' letter-spacing='2.5'>WALKAROO</text></svg>";

export const WALKAROO_DEFAULT_BANNER = "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=1200&auto=format&fit=crop&q=80";

export const WALKMATE_DEFAULT_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 48' width='180' height='48'><defs><linearGradient id='wmbg' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='%230284C7'/><stop offset='100%' stop-color='%230369A1'/></linearGradient></defs><rect width='180' height='48' rx='10' fill='url(%23wmbg)'/><circle cx='28' cy='24' r='14' fill='%23FFFFFF'/><path d='M19 27 L23 18 L26 23 L29 18 L32 23 L36 27' fill='none' stroke='%230284C7' stroke-width='2.8' stroke-linecap='round' stroke-linejoin='round'/><text x='104' y='32' text-anchor='middle' fill='%23FFFFFF' font-family='Arial, Helvetica, sans-serif' font-weight='900' font-size='20' letter-spacing='2'>WALKMATE</text></svg>";

export const WALKMATE_DEFAULT_BANNER = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80";

export const YONO_DEFAULT_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 48' width='160' height='48'><defs><linearGradient id='yonobg' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='%237C3AED'/><stop offset='100%' stop-color='%234C1D95'/></linearGradient></defs><rect width='160' height='48' rx='10' fill='url(%23yonobg)'/><circle cx='26' cy='24' r='13' fill='%23FBBF24'/><path d='M19 19 L26 26 L33 19 M26 26 V31' fill='none' stroke='%234C1D95' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/><text x='94' y='32' text-anchor='middle' fill='%23FFFFFF' font-family='Arial, Helvetica, sans-serif' font-weight='900' font-size='22' letter-spacing='3'>YONO</text></svg>";

export const YONO_DEFAULT_BANNER = "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=80";

export const INDUS_DEFAULT_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 48' width='160' height='48'><defs><linearGradient id='indbg' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='%230D9488'/><stop offset='100%' stop-color='%23115E59'/></linearGradient></defs><rect width='160' height='48' rx='10' fill='url(%23indbg)'/><circle cx='26' cy='24' r='13' fill='%23FFFFFF'/><path d='M19 18 H33 M26 18 V30 M21 30 H31' fill='none' stroke='%230D9488' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'/><text x='94' y='32' text-anchor='middle' fill='%23FFFFFF' font-family='Arial, Helvetica, sans-serif' font-weight='900' font-size='22' letter-spacing='2.5'>INDUS</text></svg>";

export const INDUS_DEFAULT_BANNER = "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1200&auto=format&fit=crop&q=80";

export const PARAGON_DEFAULT_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 48' width='180' height='48'><defs><linearGradient id='parbg' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='%231E3A8A'/><stop offset='100%' stop-color='%23172554'/></linearGradient></defs><rect width='180' height='48' rx='10' fill='url(%23parbg)'/><polygon points='26,13 36,25 31,25 31,34 21,34 21,25 16,25' fill='%23F59E0B'/><text x='104' y='32' text-anchor='middle' fill='%23FFFFFF' font-family='Arial, Helvetica, sans-serif' font-weight='900' font-size='21' letter-spacing='2.5'>PARAGON</text></svg>";

export const BAIRATHI_DEFAULT_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 48' width='180' height='48'><defs><linearGradient id='barbg' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='%2392400E'/><stop offset='100%' stop-color='%23451A03'/></linearGradient></defs><rect width='180' height='48' rx='10' fill='url(%23barbg)'/><circle cx='26' cy='24' r='13' fill='%23FDE68A'/><path d='M20 18 H26 C29 18 29 23 26 23 H20 V18 Z M20 23 H27 C30 23 30 29 27 29 H20 V23 Z' fill='%2392400E'/><text x='104' y='32' text-anchor='middle' fill='%23FFFFFF' font-family='Arial, Helvetica, sans-serif' font-weight='900' font-size='19' letter-spacing='2'>BAIRATHI</text></svg>";

export const ACTION_DEFAULT_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 48' width='160' height='48'><defs><linearGradient id='actbg' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='%23B91C1C'/><stop offset='100%' stop-color='%237F1D1D'/></linearGradient></defs><rect width='160' height='48' rx='10' fill='url(%23actbg)'/><polygon points='26,12 36,33 30,33 26,24 22,33 16,33' fill='%23FBBF24'/><text x='94' y='32' text-anchor='middle' fill='%23FFFFFF' font-family='Arial, Helvetica, sans-serif' font-weight='900' font-size='22' letter-spacing='3'>ACTION</text></svg>";

export const SPARX_DEFAULT_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 48' width='160' height='48'><defs><linearGradient id='spxbg' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='%23EA580C'/><stop offset='100%' stop-color='%239A3412'/></linearGradient></defs><rect width='160' height='48' rx='10' fill='url(%23spxbg)'/><polygon points='18,28 26,14 24,23 34,20 25,34 26,26' fill='%23FFFFFF'/><text x='94' y='32' text-anchor='middle' fill='%23FFFFFF' font-family='Arial, Helvetica, sans-serif' font-weight='900' font-size='22' letter-spacing='3'>SPARX</text></svg>";

export const CAMPUS_DEFAULT_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 48' width='160' height='48'><defs><linearGradient id='cmpbg' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='%23059669'/><stop offset='100%' stop-color='%23064E3B'/></linearGradient></defs><rect width='160' height='48' rx='10' fill='url(%23cmpbg)'/><circle cx='26' cy='24' r='13' fill='%23FFFFFF'/><path d='M21 21 L26 16 L31 21 M26 16 V31' fill='none' stroke='%23059669' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/><text x='94' y='32' text-anchor='middle' fill='%23FFFFFF' font-family='Arial, Helvetica, sans-serif' font-weight='900' font-size='20' letter-spacing='2.5'>CAMPUS</text></svg>";

// Legacy IDs to official standardized article IDs
export const LEGACY_PRODUCT_ID_MAP: Record<string, string> = {
  'men-sandals-1': 'WAL-WAL8839',
  'women-office-1': 'YO-YO4955',
  'men-sandals-2': 'WL-W5687',
  'men-casuals-1': 'BAR-BAR1012',
  'men-shoes-1': 'PAR-PAR9045',
  'men-others-1': 'IND-IND2032',
  'women-sandals-1': 'WL-WL3210',
  'women-casuals-1': 'WAL-WAL4456',
  'women-shoes-1': 'BAR-BAR7789',
  'women-others-1': 'PAR-PAR1120',
  'kids-office-1': 'IND-IND6630',
  'kids-sandals-1': 'YO-YO7080',
  'kids-casuals-1': 'WL-WL9945',
  'kids-shoes-1': 'WAL-WAL1515',
  'kids-others-1': 'BAR-BAR6320'
};

const normalizeProductString = (str?: string): string => {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};

export const getProductCanonicalKey = (product: Partial<Product>): string => {
  if (!product) return '';
  const rawId = (product.id || '').trim();
  const canonicalId = LEGACY_PRODUCT_ID_MAP[rawId] || rawId;
  const normBrand = normalizeProductString(product.brand);
  const normCategory = normalizeProductString(product.category);
  const normName = normalizeProductString(product.name);

  if (normBrand && normName) {
    return `${normBrand}::${normCategory}::${normName}`;
  }
  return normalizeProductString(canonicalId) || normName || rawId;
};

/**
 * Universal Deduplicator: Guarantees no two products share the same ID, barcode,
 * or semantic name/brand/category identity across the entire app.
 */
export const deduplicateProducts = (list: Product[]): Product[] => {
  if (!Array.isArray(list) || list.length === 0) return [];

  const seenIds = new Set<string>();
  const seenCanonicalKeys = new Set<string>();
  const seenBarcodes = new Set<string>();
  const result: Product[] = [];

  // Sort: Authoritative, newer, or non-legacy items take precedence
  const sorted = [...list].sort((a, b) => {
    const aIsLegacy = Boolean(LEGACY_PRODUCT_ID_MAP[a.id]);
    const bIsLegacy = Boolean(LEGACY_PRODUCT_ID_MAP[b.id]);
    if (aIsLegacy && !bIsLegacy) return 1;
    if (!aIsLegacy && bIsLegacy) return -1;

    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
    return bTime - aTime;
  });

  for (const item of sorted) {
    if (!item || !item.id) continue;
    const rawId = item.id.trim();
    const lowerId = rawId.toLowerCase();
    const mappedStandardId = (LEGACY_PRODUCT_ID_MAP[rawId] || rawId).toLowerCase();

    // Check duplicate by ID or legacy alias ID
    if (seenIds.has(lowerId) || seenIds.has(mappedStandardId)) {
      continue;
    }

    // Check duplicate by Barcode (if non-empty)
    const rawBarcode = (item.barcode || '').trim().toLowerCase();
    if (rawBarcode && seenBarcodes.has(rawBarcode)) {
      continue;
    }

    // Check duplicate by Semantic Footwear identity (Brand + Category + Name + Color)
    const normBrand = normalizeProductString(item.brand);
    const normCat = normalizeProductString(item.category);
    const normName = normalizeProductString(item.name);
    const normColor = normalizeProductString(item.colorName || (item as any).color || item.colorHex || '');

    const semanticKey = (normBrand && normName) ? `${normBrand}::${normCat}::${normName}${normColor ? `::${normColor}` : ''}` : '';
    const brandNameKey = (normBrand && normName && !normColor) ? `${normBrand}::${normName}` : '';

    if (semanticKey && seenCanonicalKeys.has(semanticKey)) {
      continue;
    }
    if (brandNameKey && seenCanonicalKeys.has(brandNameKey)) {
      continue;
    }

    // Register as registered unique article
    seenIds.add(lowerId);
    seenIds.add(mappedStandardId);
    if (rawBarcode) seenBarcodes.add(rawBarcode);
    if (semanticKey) seenCanonicalKeys.add(semanticKey);
    if (brandNameKey) seenCanonicalKeys.add(brandNameKey);

    result.push(item);
  }

  return result;
};

export const getBrandConfigForProduct = (product?: Product | null, brandConfigs?: BrandConfig[]): BrandConfig | null => {
  if (!product || !brandConfigs || brandConfigs.length === 0) return null;
  const brandName = (product.brand || '').trim().toLowerCase();
  const prodName = (product.name || '').toLowerCase();
  
  if (brandName) {
    const found = brandConfigs.find(
      (b) => b.brandName.toLowerCase() === brandName || b.id.toLowerCase() === brandName
    );
    if (found) return found;
  }
  
  const foundByName = brandConfigs.find(
    (b) => prodName.includes(b.brandName.toLowerCase()) || prodName.includes(b.id.toLowerCase())
  );
  if (foundByName) return foundByName;
  
  return null;
};

export const INITIAL_BRAND_CONFIGS: BrandConfig[] = [
  {
    id: 'walkaroo',
    brandName: 'Walkaroo',
    tagline: 'Be Restless',
    logoUrl: WALKAROO_DEFAULT_LOGO,
    bannerUrl: WALKAROO_DEFAULT_BANNER,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4',
    videoType: 'mp4',
    displayMediaType: 'banner',
    accentColor: '#BE123C',
    trustBadges: [
      '100% Original Walkaroo Guarantee',
      '3 Months of Only Sole Warranty',
      'All-Day Comfort – Comfortable for everyday wear.',
      'Stylish Designs – Trendy looks for every occasion.',
      'Quality Footwear – Made for reliable daily use.',
      'Affordable Prices – Great value for your money.',
      'For Everyone – Styles for men, women & kids.'
    ],
    description: 'Walkaroo footwear is engineered with high-density polyurethane and ergonomic footbed technology, tested for maximum durability and all-day feet support.',
    officialWebsite: 'https://www.walkaroo.in',
    warrantyText: '3 Months of Only Sole Warranty against manufacturing defects',
    isVerifiedPartner: true,
  },
  {
    id: 'indus',
    brandName: 'Indus',
    tagline: 'Engineered Comfort • High-Durability Daily Footwear',
    logoUrl: INDUS_DEFAULT_LOGO,
    bannerUrl: INDUS_DEFAULT_BANNER,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4',
    videoType: 'mp4',
    displayMediaType: 'banner',
    accentColor: '#0D9488',
    trustBadges: [
      '100% Genuine Indus Footwear',
      'High-Density Lightweight PU Sole',
      'Anti-Skid Tread & Deep Heel Cup',
      '3 Months Sole Bonding Warranty',
      'All-Weather Daily Wear Endurance'
    ],
    description: 'Indus delivers high-durability, lightweight PU sandals, slippers, and casual shoes engineered for everyday endurance, anti-skid safety, and maximum arch support.',
    officialWebsite: 'https://www.indusfootwear.com',
    warrantyText: '3 Months Manufacturer Warranty on Sole Bonding & Material Quality',
    isVerifiedPartner: true,
  },
  {
    id: 'walkmate',
    brandName: 'Walkmate',
    tagline: 'Step in Comfort • Everyday Walk & Travel Footwear',
    logoUrl: WALKMATE_DEFAULT_LOGO,
    bannerUrl: WALKMATE_DEFAULT_BANNER,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4',
    videoType: 'mp4',
    displayMediaType: 'banner',
    accentColor: '#0284C7',
    trustBadges: [
      '100% Genuine Walkmate Product',
      'Ergonomic Arch Support Sole',
      'Lightweight Anti-Fatigue Foam',
      '3 Months Sole Warranty',
      'Durable High-Traction Tread'
    ],
    description: 'Walkmate specializes in ultra-comfortable, lightweight walking and daily wear footwear crafted for all-day cushioning, breathability, and reliable traction.',
    officialWebsite: 'https://www.walkmatefootwear.com',
    warrantyText: '3 Months Sole Warranty against manufacturing defects',
    isVerifiedPartner: true,
  },
  {
    id: 'yono',
    brandName: 'Yono',
    tagline: 'Youthful Energy • Modern Daily Stride & Trend',
    logoUrl: YONO_DEFAULT_LOGO,
    bannerUrl: YONO_DEFAULT_BANNER,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-with-neon-details-43265-large.mp4',
    videoType: 'mp4',
    displayMediaType: 'banner',
    accentColor: '#7C3AED',
    trustBadges: [
      '100% Authentic Yono Footwear',
      'High-Bounce Responsive Sole',
      'Ultra-Flexible Breathable Mesh',
      '3 Months Manufacturer Sole Warranty',
      'Trendsetting Urban Aesthetics'
    ],
    description: 'Yono brings vibrant lifestyle sneakers and slip-ons engineered with responsive cushioning, high-durability soles, and sleek modern styling for daily performance.',
    officialWebsite: 'https://www.yonofootwear.com',
    warrantyText: '3 Months Warranty on Sole Bonding & Manufacturing Quality',
    isVerifiedPartner: true,
  },
  {
    id: 'paragon',
    brandName: 'Paragon',
    tagline: "India's Most Trusted Footwear • Genuine Quality",
    logoUrl: PARAGON_DEFAULT_LOGO,
    bannerUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-with-neon-details-43265-large.mp4',
    videoType: 'mp4',
    displayMediaType: 'banner',
    accentColor: '#1E3A8A',
    trustBadges: [
      '100% Genuine Paragon Product',
      'ISO 9001 Quality Certified',
      'Tough & Slip-Resistant Tread',
      'Direct Factory Dispatch'
    ],
    description: "Paragon has been India's household brand for over 4 decades, delivering uncompromising comfort, toughness, and affordable daily footwear.",
    officialWebsite: 'https://www.paragonfootwear.com',
    warrantyText: 'Guaranteed Authentic Paragon Product with 100% QC Inspection',
    isVerifiedPartner: true,
  },
  {
    id: 'bairathi',
    brandName: 'Bairathi',
    tagline: 'Crafted Leather & Luxury Footwear • Official Partner',
    logoUrl: BAIRATHI_DEFAULT_LOGO,
    bannerUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=1200',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-person-walking-in-boots-on-autumn-leaves-40061-large.mp4',
    videoType: 'mp4',
    displayMediaType: 'banner',
    accentColor: '#92400E',
    trustBadges: [
      '100% Genuine Leather Guarantee',
      'Handcrafted Welt Stitching',
      'Anti-Skid Rubber Sole',
      'Premium Box Packaging'
    ],
    description: 'Bairathi represents artisan footwear craftsmanship using top-grain leathers, padded insoles, and precision welt stitching.',
    officialWebsite: '',
    warrantyText: '6 Months Warranty on Sole Bonding & Genuine Leather Craft',
    isVerifiedPartner: true,
  },
  {
    id: 'action',
    brandName: 'Action',
    tagline: 'The Action Shoes Legacy • Genuine Store',
    logoUrl: ACTION_DEFAULT_LOGO,
    bannerUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-walking-with-sneakers-in-the-street-40058-large.mp4',
    videoType: 'mp4',
    displayMediaType: 'banner',
    accentColor: '#B91C1C',
    trustBadges: [
      '100% Original Action Footwear',
      'Heavy-Duty Tread Sole',
      'Lightweight Air-Cushion Tech'
    ],
    description: 'Action Shoes combines athletic performance with everyday comfort, providing high-friction soles and flexible uppers.',
    officialWebsite: 'https://www.actionshoes.com',
    warrantyText: '100% Original Factory Inspection Guaranteed',
    isVerifiedPartner: true,
  },
  {
    id: 'sparx',
    brandName: 'Sparx',
    tagline: "Add What's Next • Official Authorized Dealer",
    logoUrl: SPARX_DEFAULT_LOGO,
    bannerUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-with-neon-details-43265-large.mp4',
    videoType: 'mp4',
    displayMediaType: 'video',
    accentColor: '#EA580C',
    trustBadges: [
      '100% Authentic Sparx',
      'Flexible EVA Cushioning',
      'High Traction Grip'
    ],
    description: 'Sparx is synonymous with dynamic design, high-bounce EVA soles, and breathable mesh uppers designed for active movement.',
    officialWebsite: 'https://www.relaxofootwear.com',
    warrantyText: 'Official Sparx Manufacturer Quality Assured',
    isVerifiedPartner: true,
  }
];

interface ProductContextType {
  products: Product[];
  orders: Order[];
  stockLedgers: StockLedger[];
  brandConfigs: BrandConfig[];
  loading: boolean;
  heroVideoUrl: string;
  heroVideoUrl2: string;
  heroVideoUrl3: string;
  heroVideoUrl4: string;
  heroVideoHeading: string;
  heroVideoHeading2: string;
  heroVideoHeading3: string;
  heroVideoHeading4: string;
  heroVideoSource: 'default' | 'url' | 'local';
  heroVideoSource2: 'default' | 'url' | 'local';
  heroVideoSource3: 'default' | 'url' | 'local';
  heroVideoSource4: 'default' | 'url' | 'local';
  offersBannerUrl: string;
  offersCategoryBgUrl: string;
  heroVideos: HeroVideo[];
  heroImages: HeroImage[];
  heroBannerMode: 'images' | 'videos' | 'both';
  heroImageDuration: number;
  activeHeroVideoSlot: 1 | 2 | 3 | 4;
  categoryThumbMen: string;
  categoryThumbWomen: string;
  categoryThumbKids: string;
  addProduct: (product: Omit<Product, 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  createOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<{ success: boolean; id?: string; error?: string }>;
  createStockLedger: (ledger: Omit<StockLedger, 'id' | 'createdAt'>) => Promise<{ success: boolean; id?: string; error?: string }>;
  addBrandConfig: (brand: Omit<BrandConfig, 'id' | 'createdAt'>) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateBrandConfig: (id: string, updates: Partial<BrandConfig>) => Promise<{ success: boolean; error?: string }>;
  deleteBrandConfig: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateHeroVideoUrl: (url: string, index?: 1 | 2 | 3 | 4) => Promise<{ success: boolean; isLocalOnly?: boolean; error?: string }>;
  updateHeroVideoHeadingSlot: (heading: string, index?: 1 | 2 | 3 | 4) => Promise<{ success: boolean; error?: string }>;
  uploadLocalVideo: (file: File, index?: 1 | 2 | 3 | 4) => Promise<{ success: boolean; error?: string }>;
  resetHeroVideo: (index?: 1 | 2 | 3 | 4) => Promise<{ success: boolean; error?: string }>;
  updateActiveHeroVideoSlot: (slot: 1 | 2 | 3 | 4) => Promise<{ success: boolean; error?: string }>;
  updateOffersBannerUrl: (url: string) => Promise<{ success: boolean; error?: string }>;
  updateOffersCategoryBgUrl: (url: string) => Promise<{ success: boolean; error?: string }>;
  updateCategoryThumbnail: (category: 'Men' | 'Women' | 'Kids', url: string) => Promise<{ success: boolean; error?: string }>;
  seedProductsDatabase: () => Promise<void>;
  addHeroVideo: (name: string, url: string, isBase64?: boolean, heading?: string, targetReplaceId?: string) => Promise<{ success: boolean; replacedName?: string; error?: string }>;
  deleteHeroVideo: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateHeroVideoHeading: (id: string, heading: string) => Promise<{ success: boolean; error?: string }>;
  addHeroImage: (name: string, url: string, isBase64?: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteHeroImage: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateHeroImageSlot: (slotIndex: 1 | 2 | 3 | 4, name: string, url: string, isBase64?: boolean) => Promise<{ success: boolean; error?: string }>;
  updateHeroBannerMode: (mode: 'images' | 'videos' | 'both') => Promise<{ success: boolean; error?: string }>;
  updateHeroImageDuration: (durationSeconds: number) => Promise<{ success: boolean; error?: string }>;
  saveAllHeroBannerSetup: (setup: HeroBannerFullSetup) => Promise<{ success: boolean; error?: string }>;
  clearAllSalesOrders: () => Promise<{ success: boolean; count: number; error?: string }>;
  clearAllStockLedgers: () => Promise<{ success: boolean; count: number; error?: string }>;
  clearAllProducts: () => Promise<{ success: boolean; count: number; error?: string }>;
  clearAllData: (options?: { resetProductsToDefault?: boolean }) => Promise<{ success: boolean; summary: any; error?: string }>;
  isOfflineCacheMode: boolean;
}

export interface HeroBannerFullSetup {
  videos?: Array<{
    slot: 1 | 2 | 3 | 4;
    url: string;
    heading: string;
  }>;
  images?: Array<{
    slot: 1 | 2 | 3 | 4;
    name: string;
    url: string;
  }>;
  bannerMode?: 'images' | 'videos' | 'both';
  duration?: number;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Helper to compress large base64 images before Firestore upload (< 500KB)
export const compressImageBase64 = (
  base64: string,
  maxWidth = 1600,
  maxHeight = 1000,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64 || !base64.startsWith('data:image/')) {
      return resolve(base64);
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(base64);
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
};

// Helper to fetch chunked videos from Firestore settings
const fetchChunkedVideo = async (index: 1 | 2 | 3 | 4): Promise<string | null> => {
  try {
    const docId = `hero_video${index === 1 ? '' : index}`;
    const chunksCol = collection(db, 'settings', docId, 'chunks');
    const snap = await getDocs(chunksCol);
    if (snap.empty) return null;
    const chunks: { id: string; data: string }[] = [];
    snap.forEach(d => {
      chunks.push({ id: d.id, data: d.data().data });
    });
    chunks.sort((a, b) => {
      const idxA = parseInt(a.id.replace('chunk_', ''), 10);
      const idxB = parseInt(b.id.replace('chunk_', ''), 10);
      return idxA - idxB;
    });
    return chunks.map(c => c.data).join('');
  } catch (e) {
    console.error(`Failed to fetch chunked video ${index}:`, e);
    return null;
  }
};

// Cached video retrieval helper to strictly prevent Firestore daily read exhaustion
const getOrFetchHeroVideo = async (
  index: 1 | 2 | 3 | 4,
  currentUpdatedAt: string,
  setVideoUrl: (url: string) => void,
  setVideoSource: (source: 'default' | 'url' | 'local') => void
): Promise<void> => {
  try {
    const cacheKey = `hero_video_cache_${index}`;
    const cacheTimeKey = `prashant_hero_video_cache_updatedAt_${index}`;
    const cachedUpdatedAt = localStorage.getItem(cacheTimeKey);

    // 1. Check if we have a match in the cache
    if (cachedUpdatedAt && cachedUpdatedAt === currentUpdatedAt) {
      const cachedBlob = await getVideoBlob(cacheKey);
      if (cachedBlob) {
        const objectUrl = URL.createObjectURL(cachedBlob);
        setVideoUrl(objectUrl);
        setVideoSource('url');
        console.log(`Loaded chunked video ${index} from IndexedDB cache.`);
        return;
      }
    }

    // 2. Not in cache or outdated, fetch from Firestore
    console.log(`Cache miss/outdated for video ${index}. Fetching chunks from Firestore...`);
    const base64 = await fetchChunkedVideo(index);
    if (base64) {
      const blob = base64ToBlob(base64);
      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        setVideoUrl(objectUrl);
        setVideoSource('url');

        // Save to IndexedDB cache
        try {
          await saveVideoBlob(blob, cacheKey);
          localStorage.setItem(cacheTimeKey, currentUpdatedAt);
          console.log(`Saved chunked video ${index} to IndexedDB cache.`);
        } catch (cacheErr) {
          console.warn(`Failed to save video ${index} to cache:`, cacheErr);
        }
        return;
      }
    }

    // 3. Fallback: If fetch failed (e.g. quota exceeded) but we DO have some cached blob, use it!
    const cachedBlobFallback = await getVideoBlob(cacheKey);
    if (cachedBlobFallback) {
      const objectUrl = URL.createObjectURL(cachedBlobFallback);
      setVideoUrl(objectUrl);
      setVideoSource('url');
      console.warn(`Firestore fetch failed. Loaded stale chunked video ${index} from cache fallback.`);
    }
  } catch (err) {
    console.error(`Error in getOrFetchHeroVideo for video ${index}:`, err);
  }
};

// Helper to delete old chunks quickly
const deleteOldChunks = async (index: 1 | 2 | 3 | 4) => {
  try {
    const docId = `hero_video${index === 1 ? '' : index}`;
    const chunksCol = collection(db, 'settings', docId, 'chunks');
    const snap = await getDocs(chunksCol);
    if (!snap.empty) {
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    }
  } catch (e) {
    console.warn(`Failed to delete old chunks for video ${index}:`, e);
  }
};

// Helper to fetch chunked offers banner from Firestore settings
const fetchChunkedOffersBanner = async (): Promise<string | null> => {
  try {
    const chunksCol = collection(db, 'settings', 'offers_banner', 'chunks');
    const snap = await getDocs(chunksCol);
    if (snap.empty) return null;
    const chunks: { id: string; data: string }[] = [];
    snap.forEach(d => {
      chunks.push({ id: d.id, data: d.data().data });
    });
    chunks.sort((a, b) => {
      const idxA = parseInt(a.id.replace('chunk_', ''), 10);
      const idxB = parseInt(b.id.replace('chunk_', ''), 10);
      return idxA - idxB;
    });
    return chunks.map(c => c.data).join('');
  } catch (e) {
    console.error('Failed to fetch chunked offers banner:', e);
    return null;
  }
};

// Cached offers banner retrieval helper to sync chunked video across all devices
const getOrFetchOffersBanner = async (
  currentUpdatedAt: string,
  setOffersBannerUrl: (url: string) => void
): Promise<void> => {
  try {
    const cacheKey = 'offers_banner_cache_blob';
    const cacheTimeKey = 'prashant_offers_banner_cache_updatedAt';
    const cachedUpdatedAt = localStorage.getItem(cacheTimeKey);

    // 1. Check if we have a match in the cache
    if (cachedUpdatedAt && cachedUpdatedAt === currentUpdatedAt) {
      const cachedBlob = await getVideoBlob(cacheKey);
      if (cachedBlob) {
        const objectUrl = URL.createObjectURL(cachedBlob);
        setOffersBannerUrl(objectUrl);
        console.log('Loaded chunked offers banner from IndexedDB cache.');
        return;
      }
    }

    // 2. Cache miss or outdated, fetch chunks from Firestore
    console.log('Cache miss/outdated for offers banner. Fetching chunks from Firestore...');
    const base64 = await fetchChunkedOffersBanner();
    if (base64) {
      const blob = base64ToBlob(base64, 'video/mp4');
      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        setOffersBannerUrl(objectUrl);

        // Save to IndexedDB cache
        try {
          await saveVideoBlob(blob, cacheKey);
          localStorage.setItem(cacheTimeKey, currentUpdatedAt);
          console.log('Saved chunked offers banner to IndexedDB cache.');
        } catch (cacheErr) {
          console.warn('Failed to save offers banner to cache:', cacheErr);
        }
        return;
      } else {
        setOffersBannerUrl(base64);
        return;
      }
    }

    // 3. Fallback: If fetch failed, use cached blob if available
    const cachedBlobFallback = await getVideoBlob(cacheKey);
    if (cachedBlobFallback) {
      const objectUrl = URL.createObjectURL(cachedBlobFallback);
      setOffersBannerUrl(objectUrl);
      console.warn('Firestore fetch failed. Loaded stale chunked offers banner from cache fallback.');
    }
  } catch (err) {
    console.error('Error in getOrFetchOffersBanner:', err);
  }
};

// Helper to delete old chunks for offers banner
const deleteOldOffersBannerChunks = async () => {
  try {
    const chunksCol = collection(db, 'settings', 'offers_banner', 'chunks');
    const snap = await getDocs(chunksCol);
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
      await new Promise(r => setTimeout(r, 40));
    }
  } catch (e) {
    console.warn('Failed to delete old chunks for offers banner:', e);
  }
};

// Helper to convert Base64 back to Blob for native browser playing performance
const base64ToBlob = (base64: string, defaultMimeType: string = 'video/mp4') => {
  if (!base64 || typeof base64 !== 'string') return null;

  const trimmed = base64.trim();
  // If it's a standard web URL or blob URL, it's not a raw Base64 string
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:')) {
    return null;
  }

  try {
    let base64Data = trimmed;
    let mimeType = defaultMimeType;

    // Check if it's a Data URL (e.g. data:video/mp4;base64,...)
    if (trimmed.startsWith('data:')) {
      const parts = trimmed.split(',');
      if (parts.length < 2) return null;

      const meta = parts[0];
      const mimeMatch = meta.match(/data:(.*?);base64/);
      if (mimeMatch && mimeMatch[1]) {
        mimeType = mimeMatch[1];
      }

      base64Data = parts[1];
    }

    // Clean whitespace and handle space/plus encoding discrepancies
    base64Data = base64Data.replace(/\s/g, '');
    if (!/^[A-Za-z0-9+/=]*$/.test(base64Data)) {
      base64Data = base64Data.replace(/ /g, '+');
    }

    // Pad if needed
    while (base64Data.length % 4 !== 0) {
      base64Data += '=';
    }

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([byteNumbers], { type: mimeType });
  } catch (e) {
    console.warn('Could not parse base64 payload into Blob, using fallback source:', e);
    return null;
  }
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = localStorage.getItem('prashant_cached_products');
    if (cached) {
      try {
        const parsed: Product[] = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return deduplicateProducts(parsed);
        }
      } catch (e) {}
    }
    return deduplicateProducts(INITIAL_PRODUCTS);
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockLedgers, setStockLedgers] = useState<StockLedger[]>([]);
  const [brandConfigs, setBrandConfigs] = useState<BrandConfig[]>(() => {
    const cached = localStorage.getItem('prashant_cached_brand_configs');
    if (cached) {
      try {
        const parsed: BrandConfig[] = JSON.parse(cached);
        const deletedIds: string[] = (() => {
          try {
            const raw = localStorage.getItem('prashant_deleted_brand_ids');
            return raw ? JSON.parse(raw).map((s: string) => s.toLowerCase()) : [];
          } catch (e) {
            return [];
          }
        })();

        const list = parsed.map(b => {
          let updated = { ...b };
          if (updated.id === 'walkaroo' || updated.brandName.toLowerCase().includes('walkaroo')) {
            updated.brandName = 'Walkaroo';
            if (!updated.tagline || updated.tagline.includes('• Official Authorized Brand Store')) {
              updated.tagline = 'Be Restless';
            }
          }
          if (updated.id === 'walkaroo' && (updated.bannerUrl?.includes('542291026-7eec264c27ff') || updated.logoUrl?.includes('542291026-7eec264c27ff'))) {
            updated.logoUrl = updated.logoUrl?.includes('542291026-7eec264c27ff') ? WALKAROO_DEFAULT_LOGO : updated.logoUrl;
            updated.bannerUrl = updated.bannerUrl?.includes('542291026-7eec264c27ff') ? WALKAROO_DEFAULT_BANNER : updated.bannerUrl;
          }
          return updated;
        });

        // Add any missing initial brands (like Indus) if not deleted
        for (const initialBrand of INITIAL_BRAND_CONFIGS) {
          const brandIdLower = initialBrand.id.toLowerCase();
          const brandNameLower = initialBrand.brandName.toLowerCase();
          if (deletedIds.includes(brandIdLower) || deletedIds.includes(brandNameLower)) {
            continue;
          }
          const exists = list.some(b => 
            b.id.toLowerCase() === brandIdLower || 
            b.brandName.toLowerCase() === brandNameLower
          );
          if (!exists) {
            list.push(initialBrand);
          }
        }
        return list;
      } catch (e) {}
    }
    return INITIAL_BRAND_CONFIGS;
  });
  const [loading, setLoading] = useState(true);
  const [isOfflineCacheMode, setIsOfflineCacheMode] = useState<boolean>(false);
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>('https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4');
  const [heroVideoSource, setHeroVideoSource] = useState<'default' | 'url' | 'local'>('default');
  const [heroVideoHeading, setHeroVideoHeading] = useState<string>('Performance Reimagined');
  const [heroVideoUrl2, setHeroVideoUrl2] = useState<string>('https://assets.mixkit.co/videos/preview/mixkit-man-walking-with-sneakers-in-the-street-40058-large.mp4');
  const [heroVideoSource2, setHeroVideoSource2] = useState<'default' | 'url' | 'local'>('default');
  const [heroVideoHeading2, setHeroVideoHeading2] = useState<string>('Urban Streetwear');
  const [heroVideoUrl3, setHeroVideoUrl3] = useState<string>('https://assets.mixkit.co/videos/preview/mixkit-person-walking-in-boots-on-autumn-leaves-40061-large.mp4');
  const [heroVideoSource3, setHeroVideoSource3] = useState<'default' | 'url' | 'local'>('default');
  const [heroVideoHeading3, setHeroVideoHeading3] = useState<string>('Autumn Leather Boots');
  const [heroVideoUrl4, setHeroVideoUrl4] = useState<string>('https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-with-neon-details-43265-large.mp4');
  const [heroVideoSource4, setHeroVideoSource4] = useState<'default' | 'url' | 'local'>('default');
  const [heroVideoHeading4, setHeroVideoHeading4] = useState<string>('Neon Spotlight');
  const [offersBannerUrl, setOffersBannerUrl] = useState<string>('https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-with-neon-details-43265-large.mp4');
  const [offersCategoryBgUrl, setOffersCategoryBgUrl] = useState<string>(() => {
    return localStorage.getItem('prashant_offers_category_bg_url') || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop';
  });
  const [categoryThumbMen, setCategoryThumbMen] = useState<string>('https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop');
  const [categoryThumbWomen, setCategoryThumbWomen] = useState<string>('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop');
  const [categoryThumbKids, setCategoryThumbKids] = useState<string>('https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800&auto=format&fit=crop');
  const [heroVideos, setHeroVideos] = useState<HeroVideo[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [heroBannerMode, setHeroBannerMode] = useState<'images' | 'videos' | 'both'>(() => {
    const saved = localStorage.getItem('prashant_hero_banner_mode');
    if (saved === 'images' || saved === 'videos' || saved === 'both') return saved;
    return 'both';
  });
  const [heroImageDuration, setHeroImageDuration] = useState<number>(() => {
    const saved = localStorage.getItem('prashant_hero_image_duration');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 5;
  });
  const [activeHeroVideoSlot, setActiveHeroVideoSlotState] = useState<1 | 2 | 3 | 4>(() => {
    const saved = localStorage.getItem('prashant_active_hero_video_slot');
    if (saved === '1' || saved === '2' || saved === '3' || saved === '4') {
      return parseInt(saved, 10) as 1 | 2 | 3 | 4;
    }
    return 1;
  });
  const { currentUser, isAdmin } = useAuth();

  // Helper to convert File to Base64 string for database storage
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Load hero videos on startup from IndexedDB/LocalStorage, fallback to defaults
  useEffect(() => {
    const loadSavedVideo = async () => {
      try {
        // Load video 1
        const source1 = localStorage.getItem('prashant_hero_video_source') || 'default';
        if (source1 === 'local') {
          const savedBlob = await getVideoBlob('hero_video_blob');
          if (savedBlob) {
            const objectUrl = URL.createObjectURL(savedBlob);
            setHeroVideoUrl(objectUrl);
            setHeroVideoSource('local');
            console.log('Successfully loaded locally saved video 1 from device storage.');
          } else {
            setHeroVideoSource('default');
          }
        } else {
          const localUrl = localStorage.getItem('prashant_hero_video_url');
          if (localUrl) {
            setHeroVideoUrl(localUrl);
            setHeroVideoSource('url');
          }
        }

        // Load video 2
        const source2 = localStorage.getItem('prashant_hero_video_source2') || 'default';
        if (source2 === 'local') {
          const savedBlob2 = await getVideoBlob('hero_video_blob2');
          if (savedBlob2) {
            const objectUrl2 = URL.createObjectURL(savedBlob2);
            setHeroVideoUrl2(objectUrl2);
            setHeroVideoSource2('local');
            console.log('Successfully loaded locally saved video 2 from device storage.');
          } else {
            setHeroVideoSource2('default');
          }
        } else {
          const localUrl2 = localStorage.getItem('prashant_hero_video_url2');
          if (localUrl2) {
            setHeroVideoUrl2(localUrl2);
            setHeroVideoSource2('url');
          }
        }

        // Load video 3
        const source3 = localStorage.getItem('prashant_hero_video_source3') || 'default';
        if (source3 === 'local') {
          const savedBlob3 = await getVideoBlob('hero_video_blob3');
          if (savedBlob3) {
            const objectUrl3 = URL.createObjectURL(savedBlob3);
            setHeroVideoUrl3(objectUrl3);
            setHeroVideoSource3('local');
            console.log('Successfully loaded locally saved video 3 from device storage.');
          } else {
            setHeroVideoSource3('default');
          }
        } else {
          const localUrl3 = localStorage.getItem('prashant_hero_video_url3');
          if (localUrl3) {
            setHeroVideoUrl3(localUrl3);
            setHeroVideoSource3('url');
          }
        }

        // Load video 4
        const source4 = localStorage.getItem('prashant_hero_video_source4') || 'default';
        if (source4 === 'local') {
          const savedBlob4 = await getVideoBlob('hero_video_blob4');
          if (savedBlob4) {
            const objectUrl4 = URL.createObjectURL(savedBlob4);
            setHeroVideoUrl4(objectUrl4);
            setHeroVideoSource4('local');
            console.log('Successfully loaded locally saved video 4 from device storage.');
          } else {
            setHeroVideoSource4('default');
          }
        } else {
          const localUrl4 = localStorage.getItem('prashant_hero_video_url4');
          if (localUrl4) {
            setHeroVideoUrl4(localUrl4);
            setHeroVideoSource4('url');
          }
        }

        // Load offers banner from IndexedDB / LocalStorage safely
        try {
          const savedOffersBlob = await getVideoBlob('offers_banner_blob');
          if (savedOffersBlob) {
            const objectUrl = URL.createObjectURL(savedOffersBlob);
            setOffersBannerUrl(objectUrl);
          } else {
            const mediaStr = await getMediaItem('offers_banner_media');
            if (typeof mediaStr === 'string' && mediaStr) {
              setOffersBannerUrl(mediaStr);
            } else {
              const savedBanner = localStorage.getItem('prashant_offers_banner_url');
              if (savedBanner) setOffersBannerUrl(savedBanner);
            }
          }
        } catch (bannerErr) {
          console.warn('Could not load offers banner from storage:', bannerErr);
        }

        // Load category thumbnails / videos from IndexedDB / LocalStorage safely
        for (const cat of ['Men', 'Women', 'Kids'] as const) {
          try {
            const savedCatBlob = await getVideoBlob(`category_thumb_${cat}_blob`);
            if (savedCatBlob) {
              const objectUrl = URL.createObjectURL(savedCatBlob);
              if (cat === 'Men') setCategoryThumbMen(objectUrl);
              else if (cat === 'Women') setCategoryThumbWomen(objectUrl);
              else setCategoryThumbKids(objectUrl);
            } else {
              const mediaStr = await getMediaItem(`category_thumb_${cat}_media`);
              if (typeof mediaStr === 'string' && mediaStr) {
                if (cat === 'Men') setCategoryThumbMen(mediaStr);
                else if (cat === 'Women') setCategoryThumbWomen(mediaStr);
                else setCategoryThumbKids(mediaStr);
              } else {
                const saved = localStorage.getItem(`prashant_category_thumb_${cat}`);
                if (saved) {
                  if (cat === 'Men') setCategoryThumbMen(saved);
                  else if (cat === 'Women') setCategoryThumbWomen(saved);
                  else setCategoryThumbKids(saved);
                }
              }
            }
          } catch (catErr) {
            console.warn(`Could not load ${cat} division cover from storage:`, catErr);
          }
        }

        // Load offers category selection background from IndexedDB / LocalStorage safely
        try {
          const catBgMedia = await getMediaItem('offers_category_bg_media');
          if (typeof catBgMedia === 'string' && catBgMedia.trim()) {
            setOffersCategoryBgUrl(catBgMedia.trim());
          } else {
            const savedCatBg = localStorage.getItem('prashant_offers_category_bg_url');
            if (savedCatBg && savedCatBg.trim()) {
              setOffersCategoryBgUrl(savedCatBg.trim());
            }
          }
        } catch (catBgErr) {
          console.warn('Could not load offers category background from storage:', catBgErr);
        }

        // Load video headings
        const h1 = localStorage.getItem('prashant_hero_video_heading');
        if (h1 !== null) setHeroVideoHeading(h1);
        const h2 = localStorage.getItem('prashant_hero_video_heading2');
        if (h2 !== null) setHeroVideoHeading2(h2);
        const h3 = localStorage.getItem('prashant_hero_video_heading3');
        if (h3 !== null) setHeroVideoHeading3(h3);
        const h4 = localStorage.getItem('prashant_hero_video_heading4');
        if (h4 !== null) setHeroVideoHeading4(h4);
      } catch (e) {
        console.error('Failed to load local saved videos on startup:', e);
      }
    };
    loadSavedVideo();
  }, []);

  // Listen to products, orders, and settings in real-time based on auth state
  useEffect(() => {
    let unsubscribeProducts = () => {};
    let unsubscribeOrders = () => {};
    let unsubscribeStockLedgers = () => {};
    let unsubscribeBrandConfigs = () => {};
    let unsubscribeSettings = () => {};
    let unsubscribeSettings2 = () => {};
    let unsubscribeSettings_v3 = () => {};
    let unsubscribeSettings_v4 = () => {};
    let unsubscribeSettings3 = () => {};
    let unsubscribeThumbMen = () => {};
    let unsubscribeThumbWomen = () => {};
    let unsubscribeThumbKids = () => {};
    let unsubscribeHeroVideos = () => {};
    let unsubscribeHeroImages = () => {};
    let unsubscribeHeroBannerMode = () => {};
    let unsubscribeDuration = () => {};
    let unsubscribeOffersCategoryBg = () => {};
    let unsubscribeDeletedProducts = () => {};

    const setupListeners = async () => {
      try {
        // Retrieve deleted brands blacklist to avoid resurrecting them
        const getDeletedBrandIds = (): string[] => {
          try {
            const raw = localStorage.getItem('prashant_deleted_brand_ids');
            return raw ? JSON.parse(raw) : [];
          } catch (e) {
            return [];
          }
        };

        // 0. Subscribe to deleted_products collection in Firestore
        const deletedCol = collection(db, 'deleted_products');
        unsubscribeDeletedProducts = onSnapshot(deletedCol, (snapshot) => {
          const currentDeleted = new Set<string>();
          try {
            const raw = localStorage.getItem('prashant_deleted_product_ids');
            if (raw) {
              const local: string[] = JSON.parse(raw);
              local.forEach(id => currentDeleted.add(id));
            }
          } catch (e) {}

          snapshot.forEach(docSnap => {
            const dId = docSnap.id || (docSnap.data() as any)?.productId;
            if (dId) currentDeleted.add(dId);
          });

          const deletedList = Array.from(currentDeleted);
          try {
            localStorage.setItem('prashant_deleted_product_ids', JSON.stringify(deletedList));
          } catch (e) {}

          // Remove any deleted products from current state immediately
          setProducts(prev => {
            const filtered = prev.filter(p => !currentDeleted.has(p.id));
            const deduped = deduplicateProducts(filtered);
            try {
              localStorage.setItem('prashant_cached_products', JSON.stringify(deduped));
            } catch (e) {}
            return deduped;
          });
        });

        // 0. Subscribe to brand_configs collection
        const brandCol = collection(db, 'brand_configs');
        unsubscribeBrandConfigs = onSnapshot(brandCol,
          (snapshot) => {
            const deletedIds = getDeletedBrandIds().map(s => s.toLowerCase());

            if (snapshot.empty) {
              const filteredInitials = INITIAL_BRAND_CONFIGS.filter(b => 
                !deletedIds.includes(b.id.toLowerCase()) && 
                !deletedIds.includes(b.brandName.toLowerCase())
              );
              setBrandConfigs(filteredInitials);
            } else {
              const list: BrandConfig[] = [];
              snapshot.forEach((docSnap) => {
                const data = { ...(docSnap.data() as BrandConfig) };
                const brandIdLower = (data.id || docSnap.id).toLowerCase();
                const brandNameLower = (data.brandName || '').toLowerCase();
                
                // If explicitly marked as deleted in local session, skip
                if (deletedIds.includes(brandIdLower) || deletedIds.includes(brandNameLower)) {
                  return;
                }

                if (data.id === 'walkaroo' || (data.brandName && data.brandName.toLowerCase().includes('walkaroo'))) {
                  data.brandName = 'Walkaroo';
                  if (!data.tagline || data.tagline.includes('• Official Authorized Brand Store')) {
                    data.tagline = 'Be Restless';
                  }
                }
                list.push(data);
              });

              // Ensure initial brands (like indus, walkmate, yono) exist if not deleted
              for (const initialBrand of INITIAL_BRAND_CONFIGS) {
                const brandIdLower = initialBrand.id.toLowerCase();
                const brandNameLower = initialBrand.brandName.toLowerCase();
                if (deletedIds.includes(brandIdLower) || deletedIds.includes(brandNameLower)) {
                  continue;
                }
                const exists = list.some(b => 
                  b.id.toLowerCase() === brandIdLower || 
                  b.brandName.toLowerCase() === brandNameLower
                );
                if (!exists) {
                  list.push(initialBrand);
                }
              }

              setBrandConfigs(list);
              try {
                localStorage.setItem('prashant_cached_brand_configs', JSON.stringify(list));
              } catch (e) {}
            }
          },
          (error) => {
            console.warn('Firestore brand_configs subscription note (using cached/fallback):', error?.message || error);
          }
        );
        const productsCol = collection(db, 'products');
        unsubscribeProducts = onSnapshot(productsCol, 
          (snapshot) => {
            setIsOfflineCacheMode(false);
            const firestoreList: Product[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Product;
              if (data && data.id) {
                firestoreList.push(data);
              }
            });

            // Retrieve deleted product IDs so deletions are permanently respected
            let deletedIds: string[] = [];
            try {
              const raw = localStorage.getItem('prashant_deleted_product_ids');
              if (raw) deletedIds = JSON.parse(raw);
            } catch (e) {}

            const candidatePool: Product[] = [];

            // 1. Initial products (unless deleted)
            INITIAL_PRODUCTS.forEach(p => {
              if (p && p.id && !deletedIds.includes(p.id)) {
                candidatePool.push(p);
              }
            });

            // 2. Overlay Firestore documents (authoritative database records)
            firestoreList.forEach(p => {
              if (p && p.id && !deletedIds.includes(p.id)) {
                candidatePool.push(p);
              }
            });

            // 3. Overlay any recently added/updated local products pending sync
            try {
              const cached = localStorage.getItem('prashant_cached_products');
              if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed)) {
                  parsed.forEach((p: Product) => {
                    if (p && p.id && !deletedIds.includes(p.id)) {
                      candidatePool.push(p);
                    }
                  });
                }
              }
            } catch (e) {}

            // Deduplicate across all combined sources
            const mergedProducts = deduplicateProducts(candidatePool);
            setProducts(mergedProducts);
            try {
              localStorage.setItem('prashant_cached_products', JSON.stringify(mergedProducts));
            } catch (e) {
              console.warn('Failed to cache products locally:', e);
            }
            setLoading(false);
          },
          (error) => {
            console.warn('Firestore Products subscription error, using local cache:', error);
            setIsOfflineCacheMode(true);
            const cached = localStorage.getItem('prashant_cached_products');
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setProducts(deduplicateProducts(parsed));
                  setLoading(false);
                  return;
                }
              } catch (e) {}
            }
            setProducts(deduplicateProducts(INITIAL_PRODUCTS));
            setLoading(false);
          }
        );

        // 2. Subscribe to orders based on user role
        const ordersCol = collection(db, 'orders');
        // If there's no logged-in user, treat as guest/admin (the applet allows accessing AdminDashboard without strict login).
        // If admin is logged in, subscribe to all. If a customer is logged in, subscribe to their orders.
        const ordersQuery = (!currentUser || isAdmin || !currentUser?.mobile)
          ? ordersCol 
          : query(ordersCol, where('customerMobile', '==', String(currentUser.mobile)));

        unsubscribeOrders = onSnapshot(ordersQuery,
          (snapshot) => {
            setIsOfflineCacheMode(false);
            const list: Order[] = [];
            snapshot.forEach((docSnap) => {
              const order = docSnap.data() as Order;
              list.push(order);
            });
            // Sort by date descending
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(list);
            try {
              localStorage.setItem('prashant_cached_orders', JSON.stringify(list));
            } catch (e) {
              console.warn('Failed to cache orders locally:', e);
            }
          },
          (error) => {
            console.warn('Firestore Orders subscription error, using local cache:', error);
            setIsOfflineCacheMode(true);
            const cached = localStorage.getItem('prashant_cached_orders');
            if (cached) {
              try {
                setOrders(JSON.parse(cached));
              } catch (e) {
                setOrders([]);
              }
            } else {
              setOrders([]);
            }
          }
        );

        // 3. Subscribe to settings (hero video URL 1)
        const heroVideoDoc = doc(db, 'settings', 'hero_video');
        unsubscribeSettings = onSnapshot(heroVideoDoc,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data) {
                if (data.hasChunks) {
                  await getOrFetchHeroVideo(1, data.updatedAt || '', setHeroVideoUrl, setHeroVideoSource);
                } else if (data.url) {
                  if (data.isBase64 || data.url.startsWith('data:')) {
                    const blob = base64ToBlob(data.url);
                    if (blob) {
                      const objectUrl = URL.createObjectURL(blob);
                      setHeroVideoUrl(objectUrl);
                    } else {
                      setHeroVideoUrl(data.url);
                    }
                  } else {
                    setHeroVideoUrl(data.url);
                  }
                  setHeroVideoSource('url');
                }
                if (data.heading !== undefined) {
                  setHeroVideoHeading(data.heading);
                }
              }
            } else {
              // Set default local fallback without triggering Firestore write
              setHeroVideoUrl('https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4');
              setHeroVideoHeading('Performance Reimagined');
            }
          },
          (error) => {
            console.warn('Firestore hero_video setting note:', error?.message || error);
          }
        );

        // 4. Subscribe to settings (hero video URL 2)
        const heroVideoDoc2 = doc(db, 'settings', 'hero_video2');
        unsubscribeSettings2 = onSnapshot(heroVideoDoc2,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data) {
                if (data.hasChunks) {
                  await getOrFetchHeroVideo(2, data.updatedAt || '', setHeroVideoUrl2, setHeroVideoSource2);
                } else if (data.url) {
                  if (data.isBase64 || data.url.startsWith('data:')) {
                    const blob = base64ToBlob(data.url);
                    if (blob) {
                      const objectUrl = URL.createObjectURL(blob);
                      setHeroVideoUrl2(objectUrl);
                    } else {
                      setHeroVideoUrl2(data.url);
                    }
                  } else {
                    setHeroVideoUrl2(data.url);
                  }
                  setHeroVideoSource2('url');
                }
                if (data.heading !== undefined) {
                  setHeroVideoHeading2(data.heading);
                }
              }
            } else {
              setHeroVideoUrl2('https://assets.mixkit.co/videos/preview/mixkit-man-walking-with-sneakers-in-the-street-40058-large.mp4');
              setHeroVideoHeading2('Urban Streetwear');
            }
          },
          (error) => {
            console.warn('Firestore hero_video2 setting note:', error?.message || error);
          }
        );

        // 4b. Subscribe to settings (hero video URL 3)
        const heroVideoDoc3 = doc(db, 'settings', 'hero_video3');
        unsubscribeSettings_v3 = onSnapshot(heroVideoDoc3,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data) {
                if (data.hasChunks) {
                  await getOrFetchHeroVideo(3, data.updatedAt || '', setHeroVideoUrl3, setHeroVideoSource3);
                } else if (data.url) {
                  if (data.isBase64 || data.url.startsWith('data:')) {
                    const blob = base64ToBlob(data.url);
                    if (blob) {
                      const objectUrl = URL.createObjectURL(blob);
                      setHeroVideoUrl3(objectUrl);
                    } else {
                      setHeroVideoUrl3(data.url);
                    }
                  } else {
                    setHeroVideoUrl3(data.url);
                  }
                  setHeroVideoSource3('url');
                }
                if (data.heading !== undefined) {
                  setHeroVideoHeading3(data.heading);
                }
              }
            } else {
              setHeroVideoUrl3('https://assets.mixkit.co/videos/preview/mixkit-person-walking-in-boots-on-autumn-leaves-40061-large.mp4');
              setHeroVideoHeading3('Autumn Leather Boots');
            }
          },
          (error) => {
            console.warn('Firestore hero_video3 setting note:', error?.message || error);
          }
        );

        // 4c. Subscribe to settings (hero video URL 4)
        const heroVideoDoc4 = doc(db, 'settings', 'hero_video4');
        unsubscribeSettings_v4 = onSnapshot(heroVideoDoc4,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data) {
                if (data.hasChunks) {
                  await getOrFetchHeroVideo(4, data.updatedAt || '', setHeroVideoUrl4, setHeroVideoSource4);
                } else if (data.url) {
                  if (data.isBase64 || data.url.startsWith('data:')) {
                    const blob = base64ToBlob(data.url);
                    if (blob) {
                      const objectUrl = URL.createObjectURL(blob);
                      setHeroVideoUrl4(objectUrl);
                    } else {
                      setHeroVideoUrl4(data.url);
                    }
                  } else {
                    setHeroVideoUrl4(data.url);
                  }
                  setHeroVideoSource4('url');
                }
                if (data.heading !== undefined) {
                  setHeroVideoHeading4(data.heading);
                }
              }
            } else {
              setHeroVideoUrl4('https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-with-neon-details-43265-large.mp4');
              setHeroVideoHeading4('Neon Spotlight');
            }
          },
          (error) => {
            console.warn('Firestore hero_video4 setting note:', error?.message || error);
          }
        );

        // 5. Subscribe to settings (offers banner URL & video)
        const offersBannerDoc = doc(db, 'settings', 'offers_banner');
        unsubscribeSettings3 = onSnapshot(offersBannerDoc,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data) {
                if (data.hasChunks) {
                  // Video chunked into subcollection docs
                  getOrFetchOffersBanner(data.updatedAt || '', setOffersBannerUrl);
                } else if (data.url && data.url !== 'db_chunked') {
                  setOffersBannerUrl(data.url);
                  safeLocalStorageSet('prashant_offers_banner_url', data.url);
                }
              }
            } else {
              setOffersBannerUrl('https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-with-neon-details-43265-large.mp4');
            }
          },
          (error) => {
            console.warn('Firestore offers_banner setting note:', error?.message || error);
          }
        );

        // 5a. Subscribe to settings (category_thumb_Men)
        const thumbMenDoc = doc(db, 'settings', 'category_thumb_Men');
        unsubscribeThumbMen = onSnapshot(thumbMenDoc,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data && data.url) {
                setCategoryThumbMen(data.url);
              }
            } else {
              setCategoryThumbMen('https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop');
            }
          },
          (error) => {
            console.warn('Firestore category_thumb_Men note:', error?.message || error);
          }
        );

        // 5b. Subscribe to settings (category_thumb_Women)
        const thumbWomenDoc = doc(db, 'settings', 'category_thumb_Women');
        unsubscribeThumbWomen = onSnapshot(thumbWomenDoc,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data && data.url) {
                setCategoryThumbWomen(data.url);
              }
            } else {
              setCategoryThumbWomen('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop');
            }
          },
          (error) => {
            console.warn('Firestore category_thumb_Women note:', error?.message || error);
          }
        );

        // 5c. Subscribe to settings (category_thumb_Kids)
        const thumbKidsDoc = doc(db, 'settings', 'category_thumb_Kids');
        unsubscribeThumbKids = onSnapshot(thumbKidsDoc,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data && data.url) {
                setCategoryThumbKids(data.url);
              }
            } else {
              setCategoryThumbKids('https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800&auto=format&fit=crop');
            }
          },
          (error) => {
            console.warn('Firestore category_thumb_Kids note:', error?.message || error);
          }
        );

        // 5d. Subscribe to settings (offers_category_bg)
        const offersCatBgDoc = doc(db, 'settings', 'offers_category_bg');
        unsubscribeOffersCategoryBg = onSnapshot(offersCatBgDoc,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data && data.url && typeof data.url === 'string' && data.url.trim()) {
                const fetchedUrl = data.url.trim();
                setOffersCategoryBgUrl(fetchedUrl);
                safeLocalStorageSet('prashant_offers_category_bg_url', fetchedUrl);
                try {
                  await saveMediaItem('offers_category_bg_media', fetchedUrl);
                } catch (e) {}
              } else if (data && data.isLargeBlob) {
                try {
                  const localMedia = await getMediaItem('offers_category_bg_media');
                  if (localMedia && typeof localMedia === 'string' && localMedia.trim()) {
                    setOffersCategoryBgUrl(localMedia.trim());
                  }
                } catch (e) {}
              }
            } else {
              const localSaved = localStorage.getItem('prashant_offers_category_bg_url');
              if (localSaved && localSaved.trim()) {
                setOffersCategoryBgUrl(localSaved.trim());
              } else {
                setOffersCategoryBgUrl('https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop');
              }
            }
          },
          async (error) => {
            console.warn('Firestore offers_category_bg note:', error?.message || error);
            try {
              const localMedia = await getMediaItem('offers_category_bg_media');
              if (localMedia && typeof localMedia === 'string' && localMedia.trim()) {
                setOffersCategoryBgUrl(localMedia.trim());
                return;
              }
            } catch (e) {}
            const localSaved = localStorage.getItem('prashant_offers_category_bg_url');
            if (localSaved && localSaved.trim()) {
              setOffersCategoryBgUrl(localSaved.trim());
            }
          }
        );

        // 6. Subscribe to hero_videos collection
        const heroVideosCol = collection(db, 'hero_videos');
        unsubscribeHeroVideos = onSnapshot(heroVideosCol,
          (snapshot) => {
            const list: HeroVideo[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as HeroVideo);
            });
            list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setHeroVideos(list);
            try {
              localStorage.setItem('prashant_cached_hero_videos', JSON.stringify(list));
            } catch (e) {
              console.warn('Failed to cache hero videos locally:', e);
            }
          },
          (error) => {
            console.warn('Firestore hero_videos subscription note:', error?.message || error);
            const cached = localStorage.getItem('prashant_cached_hero_videos');
            if (cached) {
              try {
                setHeroVideos(JSON.parse(cached));
              } catch (e) {
                setHeroVideos([]);
              }
            } else {
              setHeroVideos([]);
            }
          }
        );

        // 7. Subscribe to hero_images collection
        const heroImagesCol = collection(db, 'hero_images');
        unsubscribeHeroImages = onSnapshot(heroImagesCol,
          (snapshot) => {
            if (snapshot.empty) {
              const defaultImagesList: HeroImage[] = [
                { id: 'hero-image-slot-1', name: 'Prestige Footwear', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop', isBase64: false, createdAt: new Date().toISOString() },
                { id: 'hero-image-slot-2', name: 'Urban Sneakers', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop', isBase64: false, createdAt: new Date().toISOString() },
                { id: 'hero-image-slot-3', name: 'Leather Boots', url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1200&auto=format&fit=crop', isBase64: false, createdAt: new Date().toISOString() },
                { id: 'hero-image-slot-4', name: 'Suede Edition', url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1200&auto=format&fit=crop', isBase64: false, createdAt: new Date().toISOString() }
              ];
              setHeroImages(defaultImagesList);
              return;
            }

            const list: HeroImage[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as HeroImage);
            });
            // Sort by slot ID (slot 1, 2, 3, 4) or creation date
            list.sort((a, b) => (a.id || '').localeCompare(b.id || '') || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setHeroImages(list);
            try {
              safeLocalStorageSet('prashant_cached_hero_images', JSON.stringify(list));
            } catch (e) {
              console.warn('Failed to cache hero images locally:', e);
            }
          },
          (error) => {
            console.warn('Firestore hero_images subscription note:', error?.message || error);
            const cached = localStorage.getItem('prashant_cached_hero_images');
            if (cached) {
              try {
                setHeroImages(JSON.parse(cached));
              } catch (e) {
                setHeroImages([]);
              }
            } else {
              setHeroImages([]);
            }
          }
        );

        // 7b. Subscribe to hero_banner_mode doc
        const bannerModeDoc = doc(db, 'settings', 'hero_banner_mode');
        unsubscribeHeroBannerMode = onSnapshot(bannerModeDoc,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data && (data.mode === 'images' || data.mode === 'videos' || data.mode === 'both')) {
                setHeroBannerMode(data.mode);
                safeLocalStorageSet('prashant_hero_banner_mode', data.mode);
              }
            } else {
              setHeroBannerMode('both');
            }
          },
          (err) => console.warn('Firestore hero_banner_mode subscription note:', err?.message || err)
        );

        // 7c. Subscribe to hero_image_duration doc
        const durationDoc = doc(db, 'settings', 'hero_image_duration');
        unsubscribeDuration = onSnapshot(durationDoc,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data && typeof data.duration === 'number' && data.duration > 0) {
                setHeroImageDuration(data.duration);
              }
            }
          },
          (err) => console.warn('Firestore durationDoc subscription error:', err)
        );

        // 8. Subscribe to stock_ledgers collection
        const stockLedgersCol = collection(db, 'stock_ledgers');
        unsubscribeStockLedgers = onSnapshot(stockLedgersCol,
          (snapshot) => {
            const list: StockLedger[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as StockLedger);
            });
            // Sort by createdAt descending
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setStockLedgers(list);
            try {
              localStorage.setItem('prashant_cached_stock_ledgers', JSON.stringify(list));
            } catch (e) {
              console.warn('Failed to cache stock ledgers locally:', e);
            }
          },
          (error) => {
            console.warn('Firestore stock_ledgers subscription error, using local cache:', error);
            const cached = localStorage.getItem('prashant_cached_stock_ledgers');
            if (cached) {
              try {
                setStockLedgers(JSON.parse(cached));
              } catch (e) {
                setStockLedgers([]);
              }
            } else {
              setStockLedgers([]);
            }
          }
        );
      } catch (e) {
        console.error('Failed to setup Firestore listeners:', e);
        setProducts(INITIAL_PRODUCTS);
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeStockLedgers();
      unsubscribeBrandConfigs();
      unsubscribeSettings();
      unsubscribeSettings2();
      unsubscribeSettings_v3();
      unsubscribeSettings_v4();
      unsubscribeSettings3();
      unsubscribeThumbMen();
      unsubscribeThumbWomen();
      unsubscribeThumbKids();
      unsubscribeHeroVideos();
      unsubscribeHeroImages();
      unsubscribeHeroBannerMode();
      unsubscribeDuration();
      unsubscribeOffersCategoryBg();
      unsubscribeDeletedProducts();
    };
  }, [currentUser, isAdmin]);

  const seedProductsDatabase = async () => {
    try {
      // Loop through and write each initial product to Firestore
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      console.log('Seeding products database successful!');
    } catch (error) {
      console.error('Database seeding failed:', error);
    }
  };

  const addProduct = async (prodData: Omit<Product, 'createdAt'>) => {
    const id = prodData.id || `prod-${Date.now()}`;
    const path = `products/${id}`;
    const newProduct: Product = {
      ...prodData,
      id,
      createdAt: (prodData as any).createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Remove from deleted list if re-added
    try {
      const raw = localStorage.getItem('prashant_deleted_product_ids');
      if (raw) {
        const deletedIds: string[] = JSON.parse(raw);
        const filtered = deletedIds.filter(did => did !== id);
        localStorage.setItem('prashant_deleted_product_ids', JSON.stringify(filtered));
      }
    } catch (e) {}

    // Also remove from Firestore deleted_products collection if previously deleted
    try {
      await deleteDoc(doc(db, 'deleted_products', id));
    } catch (e) {}

    // Clean up any stale duplicate document with the same name & brand from Firestore
    const canonicalKey = getProductCanonicalKey(newProduct);
    const existingDuplicate = products.find(p => p.id !== id && getProductCanonicalKey(p) === canonicalKey);
    if (existingDuplicate) {
      try {
        await deleteDoc(doc(db, 'products', existingDuplicate.id));
      } catch (e) {}
    }

    // Optimistically update local state & localStorage cache immediately with zero duplicates
    setProducts(prev => {
      const updated = deduplicateProducts([newProduct, ...prev]);
      try {
        localStorage.setItem('prashant_cached_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'products', id), newProduct);
      return { success: true };
    } catch (error) {
      console.warn('Firestore setDoc note in addProduct (saved locally):', error);
      try {
        handleFirestoreError(error, OperationType.CREATE, path);
      } catch (err: any) {
        return { success: true };
      }
      return { success: true };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
      const deduped = deduplicateProducts(updated);
      try {
        localStorage.setItem('prashant_cached_products', JSON.stringify(deduped));
      } catch (e) {}
      return deduped;
    });
    const path = `products/${id}`;
    try {
      const docRef = doc(db, 'products', id);
      await setDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return { success: true };
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, path);
      } catch (err: any) {
        return { success: true };
      }
      return { success: true };
    }
  };

  const deleteProduct = async (id: string) => {
    const path = `products/${id}`;
    // Identify all associated IDs (primary ID, legacy aliases, and any duplicate records)
    const targetProduct = products.find(p => p.id === id);
    const idsToDelete: string[] = [id];
    if (targetProduct) {
      const canonicalKey = getProductCanonicalKey(targetProduct);
      products.forEach(p => {
        if (p.id !== id && getProductCanonicalKey(p) === canonicalKey && !idsToDelete.includes(p.id)) {
          idsToDelete.push(p.id);
        }
      });
    }
    Object.entries(LEGACY_PRODUCT_ID_MAP).forEach(([legacyId, stdId]) => {
      if (stdId === id && !idsToDelete.includes(legacyId)) {
        idsToDelete.push(legacyId);
      }
    });

    // Track deleted product IDs so they don't get re-merged from initial products or cache
    try {
      const raw = localStorage.getItem('prashant_deleted_product_ids');
      const deletedIds: string[] = raw ? JSON.parse(raw) : [];
      idsToDelete.forEach(did => {
        if (!deletedIds.includes(did)) deletedIds.push(did);
      });
      localStorage.setItem('prashant_deleted_product_ids', JSON.stringify(deletedIds));
    } catch (e) {}

    // Optimistically update local state & cache so UI updates instantly across all sections
    setProducts(prev => {
      const filtered = prev.filter(p => !idsToDelete.includes(p.id));
      const deduped = deduplicateProducts(filtered);
      try {
        localStorage.setItem('prashant_cached_products', JSON.stringify(deduped));
      } catch (e) {}
      return deduped;
    });

    try {
      // 1. Permanently delete all target documents from Firestore 'products' collection
      for (const did of idsToDelete) {
        await deleteDoc(doc(db, 'products', did));
        // 2. Also register deletion marker in Firestore 'deleted_products' collection
        try {
          await setDoc(doc(db, 'deleted_products', did), {
            productId: did,
            deletedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn('Firestore deleted_products note:', e);
        }
      }

      return { success: true };
    } catch (error) {
      console.warn('Firestore deleteDoc note (saved locally):', error);
      try {
        handleFirestoreError(error, OperationType.DELETE, path);
      } catch (err: any) {
        return { success: true };
      }
      return { success: true };
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${yy}${mm}${dd}`; // e.g., "260707"
    const prefix = `PF-${datePrefix}`;

    // Find existing orders today that start with this prefix to calculate next sequence
    const todayOrders = orders.filter(o => {
      if (!o.id) return false;
      const clean = o.id.replace(/^#/, '');
      return clean.startsWith(prefix);
    });
    
    let nextSeq = 1;
    if (todayOrders.length > 0) {
      const seqs = todayOrders.map(o => {
        const clean = o.id.replace(/^#/, '');
        const seqStr = clean.replace(prefix, '');
        const parsed = parseInt(seqStr, 10);
        return isNaN(parsed) ? 0 : parsed;
      });
      nextSeq = Math.max(...seqs) + 1;
    }
    
    const id = `${prefix}${String(nextSeq).padStart(2, '0')}`;
    const path = `orders/${id}`;
    try {
      const newOrder: Order = {
        ...orderData,
        id,
        createdAt: new Date().toISOString()
      };

      // Instantly update local orders state so history logs & today's summary reflect the new bill immediately
      setOrders(prev => {
        const filtered = prev.filter(o => o.id !== id);
        const updated = [newOrder, ...filtered];
        try {
          localStorage.setItem('prashant_cached_orders', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // Deduct stock for each item grouped by product
      const orderItemsByProduct: Record<string, typeof orderData.items> = {};
      for (const item of orderData.items) {
        const prodIdKey = String(item.productId || (item as any).id || '');
        if (!orderItemsByProduct[prodIdKey]) {
          orderItemsByProduct[prodIdKey] = [];
        }
        orderItemsByProduct[prodIdKey].push(item);
      }

      // Update local product stock state immediately and persist to local cache
      setProducts(prevProducts => {
        const updatedProducts = prevProducts.map(p => {
          const itemsToDeduct = orderItemsByProduct[String(p.id)];
          if (!itemsToDeduct || itemsToDeduct.length === 0) return p;

          let currentStock = p.stock;
          let newSizeStock = p.sizeStock ? { ...p.sizeStock } : undefined;
          let newSizeColorStock = p.sizeColorStock ? JSON.parse(JSON.stringify(p.sizeColorStock)) : undefined;

          for (const item of itemsToDeduct) {
            currentStock = Math.max(0, currentStock - item.quantity);

            if (newSizeStock) {
              const sizeKey = String(item.size);
              if (newSizeStock[sizeKey] !== undefined) {
                newSizeStock[sizeKey] = Math.max(0, (newSizeStock[sizeKey] || 0) - item.quantity);
              }
            }

            if (newSizeColorStock) {
              const sizeKey = String(item.size);
              if (newSizeColorStock[sizeKey]) {
                const colorMap = newSizeColorStock[sizeKey];
                let remainingToDeduct = item.quantity;
                
                const targetColorKey = item.colorId ? String(item.colorId) : null;
                if (targetColorKey && colorMap[targetColorKey] !== undefined) {
                  const currentVal = Number(colorMap[targetColorKey]) || 0;
                  colorMap[targetColorKey] = Math.max(0, currentVal - remainingToDeduct);
                  remainingToDeduct = 0;
                } else {
                  for (const colorKey of Object.keys(colorMap)) {
                    const currentVal = Number(colorMap[colorKey]) || 0;
                    if (currentVal >= remainingToDeduct) {
                      colorMap[colorKey] = currentVal - remainingToDeduct;
                      remainingToDeduct = 0;
                      break;
                    } else {
                      colorMap[colorKey] = 0;
                      remainingToDeduct -= currentVal;
                    }
                  }
                }
              }
            }
          }

          return {
            ...p,
            stock: currentStock,
            ...(newSizeStock ? { sizeStock: newSizeStock } : {}),
            ...(newSizeColorStock ? { sizeColorStock: newSizeColorStock } : {})
          };
        });

        try {
          localStorage.setItem('prashant_cached_products', JSON.stringify(updatedProducts));
        } catch (e) {
          console.warn('Failed to cache products locally:', e);
        }

        return updatedProducts;
      });

      // Write order doc to Firestore asynchronously
      try {
        await setDoc(doc(db, 'orders', id), newOrder);

        for (const [productId, items] of Object.entries(orderItemsByProduct)) {
          const prod = products.find(p => p.id === productId);
          if (prod) {
            let currentStock = prod.stock;
            let newSizeStock = prod.sizeStock ? { ...prod.sizeStock } : undefined;
            let newSizeColorStock = prod.sizeColorStock ? JSON.parse(JSON.stringify(prod.sizeColorStock)) : undefined;

            for (const item of items) {
              currentStock = Math.max(0, currentStock - item.quantity);

              if (newSizeStock) {
                const sizeKey = String(item.size);
                if (newSizeStock[sizeKey] !== undefined) {
                  newSizeStock[sizeKey] = Math.max(0, (newSizeStock[sizeKey] || 0) - item.quantity);
                }
              }

              if (newSizeColorStock) {
                const sizeKey = String(item.size);
                if (newSizeColorStock[sizeKey]) {
                  const colorMap = newSizeColorStock[sizeKey];
                  let remainingToDeduct = item.quantity;
                  
                  const targetColorKey = item.colorId ? String(item.colorId) : null;
                  if (targetColorKey && colorMap[targetColorKey] !== undefined) {
                    const currentVal = Number(colorMap[targetColorKey]) || 0;
                    colorMap[targetColorKey] = Math.max(0, currentVal - remainingToDeduct);
                    remainingToDeduct = 0;
                  } else {
                    for (const colorKey of Object.keys(colorMap)) {
                      const currentVal = Number(colorMap[colorKey]) || 0;
                      if (currentVal >= remainingToDeduct) {
                        colorMap[colorKey] = currentVal - remainingToDeduct;
                        remainingToDeduct = 0;
                        break;
                      } else {
                        colorMap[colorKey] = 0;
                        remainingToDeduct -= currentVal;
                      }
                    }
                  }
                }
              }
            }

            const updatePayload: any = {
              stock: currentStock
            };
            if (newSizeStock) updatePayload.sizeStock = newSizeStock;
            if (newSizeColorStock) updatePayload.sizeColorStock = newSizeColorStock;

            await setDoc(doc(db, 'products', productId), {
              ...prod,
              ...updatePayload
            }, { merge: true });
          }
        }
      } catch (e) {
        console.warn('Firestore sync failed, local order saved:', e);
      }

      return { success: true, id };
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, path);
      } catch (err: any) {
        return { success: false, error: err.message };
      }
      return { success: false, error: String(error) };
    }
  };

  const createStockLedger = async (ledgerData: Omit<StockLedger, 'id' | 'createdAt'>) => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${yy}${mm}${dd}`;
    const prefix = `SL-${datePrefix}`;

    const todayLedgers = stockLedgers.filter(l => l.id && l.id.startsWith(prefix));
    let nextSeq = 1;
    if (todayLedgers.length > 0) {
      const seqs = todayLedgers.map(l => {
        const seqStr = l.id.replace(prefix, '');
        const parsed = parseInt(seqStr, 10);
        return isNaN(parsed) ? 0 : parsed;
      });
      nextSeq = Math.max(...seqs) + 1;
    }

    const id = `${prefix}${String(nextSeq).padStart(2, '0')}`;
    const path = `stock_ledgers/${id}`;
    try {
      const newLedger: StockLedger = {
        ...ledgerData,
        id,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'stock_ledgers', id), newLedger);
      return { success: true, id };
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, path);
      } catch (err: any) {
        return { success: false, error: err.message };
      }
      return { success: false, error: String(error) };
    }
  };

  const updateHeroVideoUrl = async (url: string, index: 1 | 2 | 3 | 4 = 1) => {
    try {
      let currentUrl = '';
      let currentSource: 'default' | 'url' | 'local' = 'default';
      let blobKey = '';
      let storageUrlKey = '';
      let storageSourceKey = '';
      let firestoreDocId = '';

      if (index === 1) {
        currentUrl = heroVideoUrl;
        currentSource = heroVideoSource;
        blobKey = 'hero_video_blob';
        storageUrlKey = 'prashant_hero_video_url';
        storageSourceKey = 'prashant_hero_video_source';
        firestoreDocId = 'hero_video';
      } else if (index === 2) {
        currentUrl = heroVideoUrl2;
        currentSource = heroVideoSource2;
        blobKey = 'hero_video_blob2';
        storageUrlKey = 'prashant_hero_video_url2';
        storageSourceKey = 'prashant_hero_video_source2';
        firestoreDocId = 'hero_video2';
      } else if (index === 3) {
        currentUrl = heroVideoUrl3;
        currentSource = heroVideoSource3;
        blobKey = 'hero_video_blob3';
        storageUrlKey = 'prashant_hero_video_url3';
        storageSourceKey = 'prashant_hero_video_source3';
        firestoreDocId = 'hero_video3';
      } else {
        currentUrl = heroVideoUrl4;
        currentSource = heroVideoSource4;
        blobKey = 'hero_video_blob4';
        storageUrlKey = 'prashant_hero_video_url4';
        storageSourceKey = 'prashant_hero_video_source4';
        firestoreDocId = 'hero_video4';
      }

      // Clear previous object URL if it was a local blob to prevent memory leaks
      if (currentSource === 'local' && currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }
      await clearVideoBlob(blobKey); // Clear local uploaded blob file from IndexedDB

      // Set state and localstorage
      if (index === 1) {
        setHeroVideoUrl(url);
        setHeroVideoSource('url');
      } else if (index === 2) {
        setHeroVideoUrl2(url);
        setHeroVideoSource2('url');
      } else if (index === 3) {
        setHeroVideoUrl3(url);
        setHeroVideoSource3('url');
      } else {
        setHeroVideoUrl4(url);
        setHeroVideoSource4('url');
      }
      safeLocalStorageSet(storageUrlKey, url);
      safeLocalStorageSet(storageSourceKey, 'url');

      // Delete old chunks first
      await deleteOldChunks(index);

      // Check if URL is base64 string
      const isBase64Url = url.startsWith('data:') || (url.length > 1000 && !url.startsWith('http'));

      // Attempt to save in Firestore settings
      try {
        if (isBase64Url) {
          const fitsInSingleDoc = url.length < 600000;
          if (fitsInSingleDoc) {
            await setDoc(doc(db, 'settings', firestoreDocId), {
              url,
              hasChunks: false,
              isBase64: true,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          } else {
            const chunkSize = 750000;
            const numChunks = Math.ceil(url.length / chunkSize);
            const chunkPromises = [];
            for (let i = 0; i < numChunks; i++) {
              const chunk = url.slice(i * chunkSize, (i + 1) * chunkSize);
              chunkPromises.push(
                setDoc(doc(db, 'settings', firestoreDocId, 'chunks', `chunk_${i}`), {
                  data: chunk
                })
              );
            }
            await Promise.all(chunkPromises);
            await setDoc(doc(db, 'settings', firestoreDocId), {
              url: 'db_chunked',
              hasChunks: true,
              numChunks,
              isBase64: true,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        } else {
          await setDoc(doc(db, 'settings', firestoreDocId), {
            url,
            hasChunks: false,
            isBase64: false,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
        return { success: true };
      } catch (firestoreError: any) {
        console.warn(`Firestore settings save failed for video ${index} (using local storage fallback):`, firestoreError);
        return { 
          success: true, 
          isLocalOnly: true,
          error: `Saved locally on this device. (Cloud sync permission restricted: ${firestoreError.message || firestoreError})`
        };
      }
    } catch (error) {
      console.error(`Failed to update hero video ${index} URL:`, error);
      return { success: false, error: String(error) };
    }
  };

  const updateHeroVideoHeadingSlot = async (heading: string, index: 1 | 2 | 3 | 4 = 1) => {
    try {
      const storageKey = `prashant_hero_video_heading${index === 1 ? '' : index}`;
      const firestoreDocId = `hero_video${index === 1 ? '' : index}`;

      // Update local state
      if (index === 1) {
        setHeroVideoHeading(heading);
      } else if (index === 2) {
        setHeroVideoHeading2(heading);
      } else if (index === 3) {
        setHeroVideoHeading3(heading);
      } else {
        setHeroVideoHeading4(heading);
      }

      // Save to localStorage
      localStorage.setItem(storageKey, heading);

      // Attempt to save in Firestore settings doc with merge: true
      try {
        await setDoc(doc(db, 'settings', firestoreDocId), {
          heading,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        return { success: true };
      } catch (firestoreError: any) {
        console.warn(`Firestore settings heading save failed for video ${index}:`, firestoreError);
        return { 
          success: true, 
          error: `Saved heading locally on this device. (Cloud sync permission restricted: ${firestoreError.message || firestoreError})`
        };
      }
    } catch (error) {
      console.error(`Failed to update hero video heading ${index}:`, error);
      return { success: false, error: String(error) };
    }
  };

  const uploadLocalVideo = async (file: File, index: 1 | 2 | 3 | 4 = 1) => {
    try {
      let currentUrl = '';
      let currentSource: 'default' | 'url' | 'local' = 'default';
      let blobKey = '';
      let storageUrlKey = '';
      let storageSourceKey = '';
      let firestoreDocId = '';

      if (index === 1) {
        currentUrl = heroVideoUrl;
        currentSource = heroVideoSource;
        blobKey = 'hero_video_blob';
        storageUrlKey = 'prashant_hero_video_url';
        storageSourceKey = 'prashant_hero_video_source';
        firestoreDocId = 'hero_video';
      } else if (index === 2) {
        currentUrl = heroVideoUrl2;
        currentSource = heroVideoSource2;
        blobKey = 'hero_video_blob2';
        storageUrlKey = 'prashant_hero_video_url2';
        storageSourceKey = 'prashant_hero_video_source2';
        firestoreDocId = 'hero_video2';
      } else if (index === 3) {
        currentUrl = heroVideoUrl3;
        currentSource = heroVideoSource3;
        blobKey = 'hero_video_blob3';
        storageUrlKey = 'prashant_hero_video_url3';
        storageSourceKey = 'prashant_hero_video_source3';
        firestoreDocId = 'hero_video3';
      } else {
        currentUrl = heroVideoUrl4;
        currentSource = heroVideoSource4;
        blobKey = 'hero_video_blob4';
        storageUrlKey = 'prashant_hero_video_url4';
        storageSourceKey = 'prashant_hero_video_source4';
        firestoreDocId = 'hero_video4';
      }

      // Clear previous object URL if it was a local blob to prevent memory leaks
      if (currentSource === 'local' && currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }

      await saveVideoBlob(file, blobKey);
      const objectUrl = URL.createObjectURL(file);

      // Immediately activate local objectUrl and set source to local
      if (index === 1) {
        setHeroVideoUrl(objectUrl);
        setHeroVideoSource('local');
      } else if (index === 2) {
        setHeroVideoUrl2(objectUrl);
        setHeroVideoSource2('local');
      } else if (index === 3) {
        setHeroVideoUrl3(objectUrl);
        setHeroVideoSource3('local');
      } else {
        setHeroVideoUrl4(objectUrl);
        setHeroVideoSource4('local');
      }
      safeLocalStorageSet(storageSourceKey, 'local');

      // Convert to Base64 to save in Firestore Database
      let base64Url = '';
      try {
        base64Url = await fileToBase64(file);
      } catch (e) {
        console.warn('Failed to convert file to base64:', e);
      }

      if (base64Url) {
        try {
          // Delete old chunks first
          await deleteOldChunks(index);

          // Check if Base64 can fit in a single document (under 600KB)
          const fitsInSingleDoc = base64Url.length < 600000;

          if (fitsInSingleDoc) {
            await setDoc(doc(db, 'settings', firestoreDocId), {
              url: base64Url,
              hasChunks: false,
              isBase64: true,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          } else {
            const chunkSize = 750000;
            const numChunks = Math.ceil(base64Url.length / chunkSize);
            const chunkPromises = [];
            for (let i = 0; i < numChunks; i++) {
              const chunk = base64Url.slice(i * chunkSize, (i + 1) * chunkSize);
              chunkPromises.push(
                setDoc(doc(db, 'settings', firestoreDocId, 'chunks', `chunk_${i}`), {
                  data: chunk
                })
              );
            }
            await Promise.all(chunkPromises);
            await setDoc(doc(db, 'settings', firestoreDocId), {
              url: 'db_chunked',
              hasChunks: true,
              numChunks,
              isBase64: true,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }

          if (index === 1) {
            setHeroVideoUrl(objectUrl);
            setHeroVideoSource('url');
          } else if (index === 2) {
            setHeroVideoUrl2(objectUrl);
            setHeroVideoSource2('url');
          } else if (index === 3) {
            setHeroVideoUrl3(objectUrl);
            setHeroVideoSource3('url');
          } else {
            setHeroVideoUrl4(objectUrl);
            setHeroVideoSource4('url');
          }
          safeLocalStorageSet(storageUrlKey, base64Url);
          safeLocalStorageSet(storageSourceKey, 'url');

          return { success: true };
        } catch (firestoreError: any) {
          console.warn(`Firestore settings save failed for video ${index}:`, firestoreError);
          // Fallback to local storage only
          if (index === 1) {
            setHeroVideoUrl(objectUrl);
            setHeroVideoSource('local');
          } else if (index === 2) {
            setHeroVideoUrl2(objectUrl);
            setHeroVideoSource2('local');
          } else if (index === 3) {
            setHeroVideoUrl3(objectUrl);
            setHeroVideoSource3('local');
          } else {
            setHeroVideoUrl4(objectUrl);
            setHeroVideoSource4('local');
          }
          safeLocalStorageSet(storageSourceKey, 'local');
          return {
            success: true,
            error: `Saved locally on this device. (Cloud sync notice: ${firestoreError.message || firestoreError})`
          };
        }
      } else {
        // Fallback to purely local IndexedDB caching
        if (index === 1) {
          setHeroVideoUrl(objectUrl);
          setHeroVideoSource('local');
        } else if (index === 2) {
          setHeroVideoUrl2(objectUrl);
          setHeroVideoSource2('local');
        } else if (index === 3) {
          setHeroVideoUrl3(objectUrl);
          setHeroVideoSource3('local');
        } else {
          setHeroVideoUrl4(objectUrl);
          setHeroVideoSource4('local');
        }
        safeLocalStorageSet(storageSourceKey, 'local');

        return { 
          success: true, 
          error: 'Saved to local device cache only.' 
        };
      }
    } catch (error) {
      console.error(`Failed to upload local video ${index}:`, error);
      return { success: false, error: String(error) };
    }
  };

  const updateActiveHeroVideoSlot = async (slot: 1 | 2 | 3 | 4) => {
    try {
      setActiveHeroVideoSlotState(slot);
      localStorage.setItem('prashant_active_hero_video_slot', String(slot));
      try {
        await setDoc(doc(db, 'settings', 'hero_active_slot'), {
          slot,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Firestore active slot save note (saved locally):', e);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || String(e) };
    }
  };

  const resetHeroVideo = async (index: 1 | 2 | 3 | 4 = 1) => {
    try {
      let currentUrl = '';
      let currentSource: 'default' | 'url' | 'local' = 'default';
      let blobKey = '';
      let storageUrlKey = '';
      let storageSourceKey = '';
      let firestoreDocId = '';
      let defaultUrl = '';

      if (index === 1) {
        currentUrl = heroVideoUrl;
        currentSource = heroVideoSource;
        blobKey = 'hero_video_blob';
        storageUrlKey = 'prashant_hero_video_url';
        storageSourceKey = 'prashant_hero_video_source';
        firestoreDocId = 'hero_video';
        defaultUrl = 'https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4';
      } else if (index === 2) {
        currentUrl = heroVideoUrl2;
        currentSource = heroVideoSource2;
        blobKey = 'hero_video_blob2';
        storageUrlKey = 'prashant_hero_video_url2';
        storageSourceKey = 'prashant_hero_video_source2';
        firestoreDocId = 'hero_video2';
        defaultUrl = 'https://assets.mixkit.co/videos/preview/mixkit-man-walking-with-sneakers-in-the-street-40058-large.mp4';
      } else if (index === 3) {
        currentUrl = heroVideoUrl3;
        currentSource = heroVideoSource3;
        blobKey = 'hero_video_blob3';
        storageUrlKey = 'prashant_hero_video_url3';
        storageSourceKey = 'prashant_hero_video_source3';
        firestoreDocId = 'hero_video3';
        defaultUrl = 'https://assets.mixkit.co/videos/preview/mixkit-person-walking-in-boots-on-autumn-leaves-40061-large.mp4';
      } else {
        currentUrl = heroVideoUrl4;
        currentSource = heroVideoSource4;
        blobKey = 'hero_video_blob4';
        storageUrlKey = 'prashant_hero_video_url4';
        storageSourceKey = 'prashant_hero_video_source4';
        firestoreDocId = 'hero_video4';
        defaultUrl = 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-pair-of-white-sneakers-with-neon-details-43265-large.mp4';
      }

      // Clear IndexedDB
      await clearVideoBlob(blobKey);
      
      // Clear LocalStorage URL/source
      localStorage.removeItem(storageUrlKey);
      localStorage.removeItem(storageSourceKey);

      // Clear previous object URL if it was a local blob to prevent memory leaks
      if (currentSource === 'local' && currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }

      // Restore default state
      if (index === 1) {
        setHeroVideoUrl(defaultUrl);
        setHeroVideoSource('default');
      } else if (index === 2) {
        setHeroVideoUrl2(defaultUrl);
        setHeroVideoSource2('default');
      } else if (index === 3) {
        setHeroVideoUrl3(defaultUrl);
        setHeroVideoSource3('default');
      } else {
        setHeroVideoUrl4(defaultUrl);
        setHeroVideoSource4('default');
      }

      // Delete old chunks
      await deleteOldChunks(index);

      // Restore default in Firestore settings
      try {
        await setDoc(doc(db, 'settings', firestoreDocId), {
          url: defaultUrl,
          hasChunks: false,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn(`Failed to reset setting in Firestore:`, e);
      }

      return { success: true };
    } catch (error) {
      console.error(`Failed to reset hero video ${index}:`, error);
      return { success: false, error: String(error) };
    }
  };

  const updateOffersBannerUrl = async (url: string) => {
    try {
      const trimmedUrl = url.trim();
      setOffersBannerUrl(trimmedUrl);

      // Safe save to LocalStorage (bypasses quota exceeded if large payload)
      safeLocalStorageSet('prashant_offers_banner_url', trimmedUrl);

      // Save large Base64 / blob / video data into IndexedDB for persistent local storage
      if (trimmedUrl.startsWith('data:') || trimmedUrl.startsWith('blob:') || trimmedUrl.length > 50000) {
        try {
          const blob = base64ToBlob(trimmedUrl, 'video/mp4');
          if (blob) {
            await saveVideoBlob(blob, 'offers_banner_blob');
          } else {
            await saveMediaItem('offers_banner_media', trimmedUrl);
          }
        } catch (idbErr) {
          console.warn('IndexedDB save note for offers banner:', idbErr);
        }
      }

      // Delete old chunks first
      await deleteOldOffersBannerChunks();

      const isBase64Url = trimmedUrl.startsWith('data:') || (trimmedUrl.length > 1000 && !trimmedUrl.startsWith('http'));

      try {
        if (isBase64Url) {
          const fitsInSingleDoc = trimmedUrl.length < 600000;
          if (fitsInSingleDoc) {
            await setDoc(doc(db, 'settings', 'offers_banner'), {
              url: trimmedUrl,
              hasChunks: false,
              isBase64: true,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          } else {
            const chunkSize = 600000;
            const numChunks = Math.ceil(trimmedUrl.length / chunkSize);
            for (let i = 0; i < numChunks; i++) {
              const chunk = trimmedUrl.slice(i * chunkSize, (i + 1) * chunkSize);
              if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 350));
              }
              await setDoc(doc(db, 'settings', 'offers_banner', 'chunks', `chunk_${i}`), {
                data: chunk
              });
            }
            await new Promise(resolve => setTimeout(resolve, 500));
            await setDoc(doc(db, 'settings', 'offers_banner'), {
              url: 'db_chunked',
              hasChunks: true,
              numChunks,
              isBase64: true,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        } else {
          await setDoc(doc(db, 'settings', 'offers_banner'), {
            url: trimmedUrl,
            hasChunks: false,
            isBase64: false,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
        return { success: true };
      } catch (firestoreError: any) {
        console.warn('Firestore settings save failed for offers_banner (local fallback):', firestoreError);
        return {
          success: true,
          error: `Saved locally on this device. (Cloud sync notice: ${firestoreError.message || firestoreError})`
        };
      }
    } catch (error) {
      console.error('Failed to update offers banner URL:', error);
      return { success: false, error: String(error) };
    }
  };

  const addHeroVideo = async (
    name: string, 
    url: string, 
    isBase64: boolean = false, 
    heading: string = '',
    targetReplaceId?: string
  ) => {
    let videoIdToDelete = targetReplaceId;
    let replacedName = '';

    // Prepare updated list for local state & storage fallback
    let updatedList = [...heroVideos];

    if ((updatedList.length >= 4 || videoIdToDelete) && updatedList.length > 0) {
      if (!videoIdToDelete) {
        videoIdToDelete = updatedList[0]?.id;
      }

      const videoToDel = updatedList.find(v => v.id === videoIdToDelete);
      if (videoToDel) {
        replacedName = videoToDel.name;
      }

      if (videoIdToDelete) {
        updatedList = updatedList.filter(v => v.id !== videoIdToDelete);
      }
    }

    const id = `video-${Date.now()}`;
    const newVideo: HeroVideo = {
      id,
      name,
      heading,
      url,
      isBase64,
      createdAt: new Date().toISOString()
    };
    updatedList.push(newVideo);

    try {
      if (videoIdToDelete) {
        try {
          await deleteDoc(doc(db, 'hero_videos', videoIdToDelete));
        } catch (delErr) {
          console.warn(`Could not delete old video document ${videoIdToDelete}:`, delErr);
        }
      }

      await setDoc(doc(db, 'hero_videos', id), newVideo);
      
      setHeroVideos(updatedList);
      try {
        localStorage.setItem('prashant_cached_hero_videos', JSON.stringify(updatedList));
      } catch (e) {
        console.warn('Failed to cache hero videos in localStorage:', e);
      }

      return { success: true, replacedName };
    } catch (error: any) {
      console.warn('Firestore setDoc failed, applying local state fallback:', error);
      
      setHeroVideos(updatedList);
      try {
        localStorage.setItem('prashant_cached_hero_videos', JSON.stringify(updatedList));
      } catch (e) {
        console.warn('Failed to cache hero videos in localStorage:', e);
      }

      const isQuota = String(error).includes('quota') || String(error).includes('resource-exhausted');
      return { 
        success: true, 
        replacedName, 
        error: isQuota ? 'Firestore quota reached: Saved locally in browser session.' : undefined 
      };
    }
  };

  const updateHeroVideoHeading = async (id: string, heading: string) => {
    const updatedList = heroVideos.map(v => v.id === id ? { ...v, heading } : v);
    setHeroVideos(updatedList);
    try {
      localStorage.setItem('prashant_cached_hero_videos', JSON.stringify(updatedList));
    } catch (e) {}

    try {
      await updateDoc(doc(db, 'hero_videos', id), { heading });
      return { success: true };
    } catch (error) {
      console.warn('Firestore updateDoc failed, keeping local update:', error);
      return { success: true };
    }
  };

  const deleteHeroVideo = async (id: string) => {
    const updatedList = heroVideos.filter(v => v.id !== id);
    setHeroVideos(updatedList);
    try {
      localStorage.setItem('prashant_cached_hero_videos', JSON.stringify(updatedList));
    } catch (e) {}

    try {
      await deleteDoc(doc(db, 'hero_videos', id));
      return { success: true };
    } catch (error) {
      console.warn('Firestore deleteDoc failed, keeping local deletion:', error);
      return { success: true };
    }
  };

  const addHeroImage = async (name: string, url: string, isBase64: boolean = false) => {
    let processedUrl = url.trim();
    if (processedUrl.startsWith('data:image/') && processedUrl.length > 250000) {
      try {
        processedUrl = await compressImageBase64(processedUrl, 1600, 1000, 0.85);
      } catch (e) {
        console.warn('Image compression note in addHeroImage:', e);
      }
    }

    let updatedList = [...heroImages];
    if (updatedList.length >= 4) {
      updatedList = updatedList.slice(1);
    }

    const id = `image-${Date.now()}`;
    const newImage: HeroImage = {
      id,
      name,
      url: processedUrl,
      isBase64,
      createdAt: new Date().toISOString()
    };
    updatedList.push(newImage);

    try {
      await setDoc(doc(db, 'hero_images', id), newImage);
      setHeroImages(updatedList);
      try {
        safeLocalStorageSet('prashant_cached_hero_images', JSON.stringify(updatedList));
      } catch (e) {}
      return { success: true };
    } catch (error) {
      console.warn('Firestore addHeroImage failed, using local fallback:', error);
      setHeroImages(updatedList);
      try {
        safeLocalStorageSet('prashant_cached_hero_images', JSON.stringify(updatedList));
      } catch (e) {}
      return { success: true };
    }
  };

  const deleteHeroImage = async (id: string) => {
    const updatedList = heroImages.filter(img => img.id !== id);
    setHeroImages(updatedList);
    try {
      safeLocalStorageSet('prashant_cached_hero_images', JSON.stringify(updatedList));
    } catch (e) {}

    try {
      await deleteDoc(doc(db, 'hero_images', id));
      return { success: true };
    } catch (error) {
      console.warn('Firestore deleteHeroImage failed, keeping local deletion:', error);
      return { success: true };
    }
  };

  const updateHeroImageSlot = async (slotIndex: 1 | 2 | 3 | 4, name: string, url: string, isBase64: boolean = false) => {
    let processedUrl = url.trim();
    if (processedUrl.startsWith('data:image/') && processedUrl.length > 250000) {
      try {
        processedUrl = await compressImageBase64(processedUrl, 1600, 1000, 0.85);
      } catch (e) {
        console.warn('Image compression note in updateHeroImageSlot:', e);
      }
    }

    const id = `hero-image-slot-${slotIndex}`;
    const newImage: HeroImage = {
      id,
      name,
      url: processedUrl,
      isBase64,
      createdAt: new Date().toISOString()
    };

    setHeroImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const next = [...filtered, newImage].sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      safeLocalStorageSet('prashant_cached_hero_images', JSON.stringify(next));
      return next;
    });

    try {
      await setDoc(doc(db, 'hero_images', id), newImage);
      return { success: true };
    } catch (error: any) {
      console.warn(`Firestore hero image slot ${slotIndex} save error:`, error);
      return { success: true, error: error.message || String(error) };
    }
  };

  const updateHeroBannerMode = async (mode: 'images' | 'videos' | 'both') => {
    setHeroBannerMode(mode);
    localStorage.setItem('prashant_hero_banner_mode', mode);
    try {
      await setDoc(doc(db, 'settings', 'hero_banner_mode'), {
        mode,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (err: any) {
      return { success: true, error: err.message || String(err) };
    }
  };

  const updateHeroImageDuration = async (durationSeconds: number) => {
    const validSec = Math.max(1, Math.min(120, durationSeconds || 5));
    setHeroImageDuration(validSec);
    localStorage.setItem('prashant_hero_image_duration', String(validSec));
    try {
      await setDoc(doc(db, 'settings', 'hero_image_duration'), {
        duration: validSec,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (err: any) {
      return { success: true, error: err.message || String(err) };
    }
  };

  const saveAllHeroBannerSetup = async (setup: HeroBannerFullSetup) => {
    try {
      const promises: Promise<any>[] = [];

      // 1. Process and save video slots (1 to 4)
      if (setup.videos && setup.videos.length > 0) {
        for (const v of setup.videos) {
          const docId = `hero_video${v.slot === 1 ? '' : v.slot}`;
          const isBase64 = v.url.startsWith('data:video/') || v.url.startsWith('data:');
          const isBlob = v.url.startsWith('blob:');

          if (v.slot === 1) {
            setHeroVideoUrl(v.url);
            setHeroVideoHeading(v.heading);
            safeLocalStorageSet('prashant_hero_video_heading', v.heading);
            if (!isBlob) safeLocalStorageSet('prashant_hero_video_url', v.url);
          } else if (v.slot === 2) {
            setHeroVideoUrl2(v.url);
            setHeroVideoHeading2(v.heading);
            safeLocalStorageSet('prashant_hero_video_heading2', v.heading);
            if (!isBlob) safeLocalStorageSet('prashant_hero_video_url2', v.url);
          } else if (v.slot === 3) {
            setHeroVideoUrl3(v.url);
            setHeroVideoHeading3(v.heading);
            safeLocalStorageSet('prashant_hero_video_heading3', v.heading);
            if (!isBlob) safeLocalStorageSet('prashant_hero_video_url3', v.url);
          } else if (v.slot === 4) {
            setHeroVideoUrl4(v.url);
            setHeroVideoHeading4(v.heading);
            safeLocalStorageSet('prashant_hero_video_heading4', v.heading);
            if (!isBlob) safeLocalStorageSet('prashant_hero_video_url4', v.url);
          }

          if (!isBlob) {
            promises.push(
              setDoc(doc(db, 'settings', docId), {
                url: v.url,
                heading: v.heading,
                isBase64,
                updatedAt: new Date().toISOString()
              }, { merge: true })
            );
          } else {
            promises.push(
              setDoc(doc(db, 'settings', docId), {
                heading: v.heading,
                updatedAt: new Date().toISOString()
              }, { merge: true })
            );
          }
        }
      }

      // 2. Process and save image slots (1 to 4)
      if (setup.images && setup.images.length > 0) {
        for (const img of setup.images) {
          let processedUrl = img.url.trim();
          if (processedUrl.startsWith('data:image/') && processedUrl.length > 250000) {
            try {
              processedUrl = await compressImageBase64(processedUrl, 1600, 1000, 0.85);
            } catch (e) {}
          }
          const id = `hero-image-slot-${img.slot}`;
          const newImage: HeroImage = {
            id,
            name: img.name,
            url: processedUrl,
            isBase64: processedUrl.startsWith('data:'),
            createdAt: new Date().toISOString()
          };

          promises.push(setDoc(doc(db, 'hero_images', id), newImage));
        }
      }

      // 3. Banner Mode
      if (setup.bannerMode) {
        setHeroBannerMode(setup.bannerMode);
        localStorage.setItem('prashant_hero_banner_mode', setup.bannerMode);
        promises.push(
          setDoc(doc(db, 'settings', 'hero_banner_mode'), {
            mode: setup.bannerMode,
            updatedAt: new Date().toISOString()
          }, { merge: true })
        );
      }

      // 4. Image Duration
      if (setup.duration) {
        const validSec = Math.max(1, Math.min(120, setup.duration));
        setHeroImageDuration(validSec);
        localStorage.setItem('prashant_hero_image_duration', String(validSec));
        promises.push(
          setDoc(doc(db, 'settings', 'hero_image_duration'), {
            duration: validSec,
            updatedAt: new Date().toISOString()
          }, { merge: true })
        );
      }

      await Promise.all(promises);
      return { success: true };
    } catch (err: any) {
      console.warn('Error saving all hero banner setup to Firestore:', err);
      return { success: true, error: err.message || String(err) };
    }
  };

  const addBrandConfig = async (brandData: Omit<BrandConfig, 'id' | 'createdAt'>) => {
    const id = brandData.brandName.toLowerCase().replace(/[^a-z0-9]/g, '_') || `brand_${Date.now()}`;
    const newBrand: BrandConfig = {
      ...brandData,
      id,
      createdAt: new Date().toISOString()
    };

    // Remove from deleted blacklist if restoring/re-adding
    try {
      const raw = localStorage.getItem('prashant_deleted_brand_ids');
      if (raw) {
        const deletedIds: string[] = JSON.parse(raw);
        const filtered = deletedIds.filter(d => d.toLowerCase() !== id.toLowerCase() && d.toLowerCase() !== brandData.brandName.toLowerCase());
        localStorage.setItem('prashant_deleted_brand_ids', JSON.stringify(filtered));
      }
    } catch (e) {}

    try {
      await setDoc(doc(db, 'brand_configs', id), newBrand, { merge: true });
      setBrandConfigs(prev => {
        const next = [...prev.filter(b => b.id !== id), newBrand];
        try {
          localStorage.setItem('prashant_cached_brand_configs', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      return { success: true, id };
    } catch (error: any) {
      console.warn('Firestore setDoc for brand_configs warning (using local sync):', error);
      setBrandConfigs(prev => {
        const next = [...prev.filter(b => b.id !== id), newBrand];
        try {
          localStorage.setItem('prashant_cached_brand_configs', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      return { success: true, id };
    }
  };

  const updateBrandConfig = async (id: string, updates: Partial<BrandConfig>) => {
    try {
      // Remove from deleted blacklist if updating
      try {
        const raw = localStorage.getItem('prashant_deleted_brand_ids');
        if (raw) {
          const deletedIds: string[] = JSON.parse(raw);
          const filtered = deletedIds.filter(d => d.toLowerCase() !== id.toLowerCase() && (updates.brandName ? d.toLowerCase() !== updates.brandName.toLowerCase() : true));
          localStorage.setItem('prashant_deleted_brand_ids', JSON.stringify(filtered));
        }
      } catch (e) {}

      const existing = brandConfigs.find(b => b.id === id) || {
        id,
        brandName: id,
        tagline: '',
        description: '',
        logoUrl: '',
        bannerUrl: '',
        accentColor: '#BE123C',
        displayMediaType: 'banner' as const,
        isVerifiedPartner: true,
        trustBadges: [],
        createdAt: new Date().toISOString()
      };
      const mergedBrand: BrandConfig = { ...existing, ...updates };

      // Write merged doc directly to Firestore collection brand_configs
      await setDoc(doc(db, 'brand_configs', id), mergedBrand, { merge: true });

      setBrandConfigs(prev => {
        const next = prev.map(b => b.id === id ? { ...b, ...updates } : b);
        try {
          localStorage.setItem('prashant_cached_brand_configs', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      return { success: true };
    } catch (error: any) {
      console.warn('Firestore update error for brand_configs (using local sync):', error);
      setBrandConfigs(prev => {
        const next = prev.map(b => b.id === id ? { ...b, ...updates } : b);
        try {
          localStorage.setItem('prashant_cached_brand_configs', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      return { success: true };
    }
  };

  const deleteBrandConfig = async (id: string) => {
    // Record into deleted blacklist so it won't be resurrected
    const targetBrand = brandConfigs.find(b => b.id === id);
    const brandName = targetBrand?.brandName || id;

    try {
      const raw = localStorage.getItem('prashant_deleted_brand_ids');
      const deletedIds: string[] = raw ? JSON.parse(raw) : [];
      if (!deletedIds.includes(id)) deletedIds.push(id);
      if (brandName && !deletedIds.includes(brandName)) deletedIds.push(brandName);
      if (brandName.toLowerCase() && !deletedIds.includes(brandName.toLowerCase())) deletedIds.push(brandName.toLowerCase());
      localStorage.setItem('prashant_deleted_brand_ids', JSON.stringify(deletedIds));
    } catch (e) {}

    try {
      await deleteDoc(doc(db, 'brand_configs', id));
      // Also attempt deleting by lower-cased name if id differed
      if (brandName && brandName.toLowerCase() !== id.toLowerCase()) {
        try {
          await deleteDoc(doc(db, 'brand_configs', brandName.toLowerCase()));
        } catch (e) {}
      }
      setBrandConfigs(prev => {
        const next = prev.filter(b => b.id !== id && b.brandName.toLowerCase() !== brandName.toLowerCase());
        try {
          localStorage.setItem('prashant_cached_brand_configs', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      return { success: true };
    } catch (error: any) {
      setBrandConfigs(prev => {
        const next = prev.filter(b => b.id !== id && b.brandName.toLowerCase() !== brandName.toLowerCase());
        try {
          localStorage.setItem('prashant_cached_brand_configs', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      return { success: true };
    }
  };

  const updateOffersCategoryBgUrl = async (url: string) => {
    try {
      let finalUrl = url ? url.trim() : '';
      if (!finalUrl) {
        finalUrl = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop';
      }

      // If it's a data URL / Base64 image, compress for optimal storage, speed and cloud sync
      if (finalUrl.startsWith('data:image') || finalUrl.startsWith('data:;base64') || (finalUrl.startsWith('data:') && !finalUrl.includes('svg'))) {
        try {
          finalUrl = await compressImage(finalUrl, 1600, 0.85);
        } catch (compErr) {
          console.warn('Could not compress image data URL, using original:', compErr);
        }
      }

      // Update state immediately so UI re-renders without wait
      setOffersCategoryBgUrl(finalUrl);
      safeLocalStorageSet('prashant_offers_category_bg_url', finalUrl);

      // Save into IndexedDB for persistent storage
      try {
        await saveMediaItem('offers_category_bg_media', finalUrl);
      } catch (idbErr) {
        console.warn('IndexedDB save note for offers_category_bg:', idbErr);
      }

      // Save to Firestore settings
      try {
        if (finalUrl.length < 900000) {
          await setDoc(doc(db, 'settings', 'offers_category_bg'), {
            url: finalUrl,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } else {
          await setDoc(doc(db, 'settings', 'offers_category_bg'), {
            isLargeBlob: true,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
        return { success: true };
      } catch (firestoreError: any) {
        console.warn('Firestore settings save notice for offers_category_bg:', firestoreError);
        return {
          success: true,
          error: `Saved locally on this device. (Cloud notice: ${firestoreError.message || firestoreError})`
        };
      }
    } catch (error: any) {
      console.error('Failed to update offers category background URL:', error);
      return { success: false, error: String(error?.message || error) };
    }
  };

  const updateCategoryThumbnail = async (category: 'Men' | 'Women' | 'Kids', url: string) => {
    try {
      const trimmedUrl = url.trim();
      if (category === 'Men') {
        setCategoryThumbMen(trimmedUrl);
      } else if (category === 'Women') {
        setCategoryThumbWomen(trimmedUrl);
      } else {
        setCategoryThumbKids(trimmedUrl);
      }

      // Safe save to LocalStorage (bypasses quota exceeded if large payload)
      safeLocalStorageSet(`prashant_category_thumb_${category}`, trimmedUrl);

      // Save large Base64 / blob / video data into IndexedDB for persistent local storage
      if (trimmedUrl.startsWith('data:') || trimmedUrl.startsWith('blob:') || trimmedUrl.length > 50000) {
        try {
          const blob = base64ToBlob(trimmedUrl, 'video/mp4');
          if (blob) {
            await saveVideoBlob(blob, `category_thumb_${category}_blob`);
          } else {
            await saveMediaItem(`category_thumb_${category}_media`, trimmedUrl);
          }
        } catch (idbErr) {
          console.warn(`IndexedDB save note for category_thumb_${category}:`, idbErr);
        }
      }

      // Save to Firestore if within size limit
      if (trimmedUrl.length < 900000) {
        try {
          await setDoc(doc(db, 'settings', `category_thumb_${category}`), {
            url: trimmedUrl,
            updatedAt: new Date().toISOString()
          });
          return { success: true };
        } catch (firestoreError: any) {
          console.warn(`Firestore settings save failed for category_thumb_${category}:`, firestoreError);
          return {
            success: true,
            error: `Saved locally on this device. (Cloud sync notice: ${firestoreError.message || firestoreError})`
          };
        }
      } else {
        try {
          await setDoc(doc(db, 'settings', `category_thumb_${category}`), {
            isLargeBlob: true,
            updatedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn('Firestore settings marker save note:', e);
        }
        return { success: true };
      }
    } catch (error) {
      console.error(`Failed to update category thumb ${category} URL:`, error);
      return { success: false, error: String(error) };
    }
  };

  const clearAllSalesOrders = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const ordersCol = collection(db, 'orders');
      const snap = await getDocs(ordersCol);
      const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      setOrders([]);
      try {
        localStorage.removeItem('prashant_cached_orders');
      } catch (e) {}
      return { success: true, count: snap.docs.length };
    } catch (e: any) {
      console.error('Failed to clear orders:', e);
      return { success: false, count: 0, error: e?.message || String(e) };
    }
  };

  const clearAllStockLedgers = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const colRef = collection(db, 'stock_ledgers');
      const snap = await getDocs(colRef);
      const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      setStockLedgers([]);
      try {
        localStorage.removeItem('prashant_cached_stock_ledgers');
      } catch (e) {}
      return { success: true, count: snap.docs.length };
    } catch (e: any) {
      console.error('Failed to clear stock ledgers:', e);
      return { success: false, count: 0, error: e?.message || String(e) };
    }
  };

  const clearAllProducts = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const colRef = collection(db, 'products');
      const snap = await getDocs(colRef);
      const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      setProducts([]);
      try {
        localStorage.removeItem('prashant_cached_products');
      } catch (e) {}
      return { success: true, count: snap.docs.length };
    } catch (e: any) {
      console.error('Failed to clear products:', e);
      return { success: false, count: 0, error: e?.message || String(e) };
    }
  };

  const clearAllData = async (options?: { resetProductsToDefault?: boolean }): Promise<{ success: boolean; summary: any; error?: string }> => {
    try {
      const ordersRes = await clearAllSalesOrders();
      const ledgersRes = await clearAllStockLedgers();
      
      // Clear localStorage collections
      const keysToRemove = [
        'prashant_wholesale_demands_v1',
        'prashant_customer_khata_v1',
        'prashant_customer_ledgers_v1',
        'prashant_product_offers_v1',
        'prashant_offers_v1',
        'prashant_coupons_v1',
        'prashant_audit_logs_v1',
        'prashant_cached_orders',
        'prashant_cached_stock_ledgers',
      ];
      keysToRemove.forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
      });

      let productsClearedCount = 0;
      if (options?.resetProductsToDefault) {
        // Reset stock to initial stock levels and ensure all standard products are in Firestore
        for (const prod of INITIAL_PRODUCTS) {
          await setDoc(doc(db, 'products', prod.id), prod);
        }
        setProducts(INITIAL_PRODUCTS);
        try { localStorage.setItem('prashant_cached_products', JSON.stringify(INITIAL_PRODUCTS)); } catch (e) {}
      } else if (options?.resetProductsToDefault === false) {
        const prodRes = await clearAllProducts();
        productsClearedCount = prodRes.count;
      }

      return {
        success: true,
        summary: {
          ordersCleared: ordersRes.count,
          ledgersCleared: ledgersRes.count,
          productsCleared: productsClearedCount,
          localCachesCleared: keysToRemove.length
        }
      };
    } catch (e: any) {
      console.error('Failed to execute clearAllData:', e);
      return { success: false, summary: null, error: e?.message || String(e) };
    }
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      orders, 
      stockLedgers,
      brandConfigs,
      loading, 
      heroVideoUrl, 
      heroVideoUrl2,
      heroVideoUrl3,
      heroVideoUrl4,
      heroVideoHeading,
      heroVideoHeading2,
      heroVideoHeading3,
      heroVideoHeading4,
      heroVideoSource,
      heroVideoSource2,
      heroVideoSource3,
      heroVideoSource4,
      offersBannerUrl,
      offersCategoryBgUrl,
      heroVideos,
      heroImages,
      heroBannerMode,
      heroImageDuration,
      activeHeroVideoSlot,
      categoryThumbMen,
      categoryThumbWomen,
      categoryThumbKids,
      addProduct, 
      updateProduct, 
      deleteProduct, 
      createOrder, 
      createStockLedger,
      addBrandConfig,
      updateBrandConfig,
      deleteBrandConfig,
      updateHeroVideoUrl, 
      updateHeroVideoHeadingSlot,
      uploadLocalVideo,
      resetHeroVideo,
      updateActiveHeroVideoSlot,
      updateOffersBannerUrl,
      updateOffersCategoryBgUrl,
      updateCategoryThumbnail,
      seedProductsDatabase,
      addHeroVideo,
      deleteHeroVideo,
      updateHeroVideoHeading,
      addHeroImage,
      deleteHeroImage,
      updateHeroImageSlot,
      updateHeroBannerMode,
      updateHeroImageDuration,
      saveAllHeroBannerSetup,
      clearAllSalesOrders,
      clearAllStockLedgers,
      clearAllProducts,
      clearAllData,
      isOfflineCacheMode
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
