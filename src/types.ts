export type Category = 'Men' | 'Women' | 'Kids';

export type SubCategory = 'Office Wear' | 'Sandals' | 'Casuals' | 'Shoes' | 'Others' | 'Stylish Wear' | 'Fashionable';

export interface Product {
  id: string;
  name: string;
  category: Category;
  subCategory: SubCategory;
  sizes: number[];
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
  createdAt: string;
  updatedAt?: string;
  lastStockAddedAt?: string;
  sizeStock?: Record<string, number>;
  sizeColorStock?: Record<string, Record<string, number>>;
  colors?: number[];
  brand?: string;
  barcode?: string;
  imageUrls?: string[];
  customColorMap?: Record<string, { name: string; hex: string; textClass: string; bgClass: string; borderClass: string; badgeClass: string }>;
  articleCode?: string;
  rawArticleCode?: string;
  colorName?: string;
  colorHex?: string;
  mrp?: number;
  originalPrice?: number;
  discountPercentage?: number;
}

export interface UserSession {
  uid: string;
  mobile: string;
  role: 'admin' | 'customer';
  createdAt: string;
}

export interface CartItem {
  product: Product;
  selectedSize: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerMobile: string;
  customerName?: string;
  items: {
    productId: string;
    name: string;
    category: Category;
    subCategory: SubCategory;
    price: number;
    quantity: number;
    size: number;
    colorId?: number;
    imageUrl?: string;
    color?: string;
    articleCode?: string;
  }[];
  totalAmount: number;
  paymentMethod: string;
  status: 'completed' | 'pending';
  createdAt: string;
}

export interface HeroVideo {
  id: string;
  name: string;
  heading?: string;
  url: string;
  createdAt: string;
  isBase64?: boolean;
}

export interface HeroImage {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  isBase64?: boolean;
}

export interface StockLedgerItem {
  productId: string;
  name: string;
  brand?: string;
  category?: Category | string;
  subCategory?: SubCategory | string;
  size: number | string;
  colorId: number;
  colorName?: string;
  quantity: number;
  imageUrl?: string;
  rawArticleCode?: string;
  articleCode?: string;
  productName?: string;
  purchaseRate?: number;
  mrp?: number;
}

export interface StockLedger {
  id: string;
  createdAt: string;
  items: StockLedgerItem[];
  totalUnits: number;
  status: 'completed' | 'draft';
  notes?: string;
  reference?: string;
  supplier?: string;
  operatorMobile?: string;
  isReplacedPair?: boolean;
  originalOrderId?: string;
}

export interface BrandConfig {
  id: string;
  brandName: string;
  tagline?: string;
  logoUrl?: string;
  bannerUrl?: string;
  videoUrl?: string;
  videoType?: 'youtube' | 'mp4' | 'auto';
  displayMediaType?: 'banner' | 'video' | 'none';
  accentColor?: string;
  trustBadges?: string[];
  description?: string;
  officialWebsite?: string;
  warrantyText?: string;
  isVerifiedPartner?: boolean;
  createdAt?: string;
}


