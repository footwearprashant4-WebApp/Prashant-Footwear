export type Category = 'Men' | 'Women' | 'Kids';

export type SubCategory = 'Office Wear' | 'Sandals' | 'Casuals' | 'Shoes' | 'Others';

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
  }[];
  totalAmount: number;
  paymentMethod: string;
  status: 'completed' | 'pending';
  createdAt: string;
}

export interface HeroVideo {
  id: string;
  name: string;
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

