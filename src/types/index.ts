
export interface Review {
  id: string;
  userId: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  avatarUrl?: string | null;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images?: string[];
  description: string;
  sizes: string[];
  colors?: string[];
  category?: string;
  brand?: string;
  averageRating?: number;
  reviewCount?: number;
  reviews?: Review[];
  stock?: number;
  tags?: string[];
  sku?: string;
  dataAiHint?: string;
  offerStartDate?: any;
  offerEndDate?: any;
}

export interface CartItemData extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor?: string | null;
}

export interface UserData {
  uid: string;
  email: string;
  fullName?: string;
  mobileNumber?: string;
  role: 'user' | 'admin';
  memberSince?: string;
  avatarUrl?: string | null;
  defaultShippingAddress?: ShippingAddress;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  selectedSize: string;
  selectedColor: string | null;
  imageUrl: string;
  sku: string | null;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phoneNumber: string | null;
  email: string;
}

export interface Order {
  id?: string;
  userId: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount?: number | null;
  grandTotal: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: any;
  cancellationReason?: string;
  cancelledBy?: 'user' | 'store';
  appliedCouponCode?: string | null; // Added to store applied coupon
}

export interface PaymentSettings {
  enableCOD: boolean;
  enableOnlinePayments: boolean;
  upiId?: string;
  qrCodeUrl?: string;
}

export interface ThemeSettings {
  selectedColor: string;
  displayMode: 'light' | 'dark';
}

export interface StoreSettings {
  paymentConfig?: PaymentSettings;
  themeConfig?: ThemeSettings;
}

export interface Coupon {
  id?: string; // Firestore document ID
  code: string; // The coupon code itself, e.g., SUMMER20
  discountType: 'percentage' | 'fixed'; // Type of discount
  discountValue: number; // Value of the discount (e.g., 20 for 20% or 200 for ₹200)
  expiryDate?: any; // Firestore Timestamp or null
  minPurchaseAmount?: number; // Optional minimum purchase to apply coupon
  isActive: boolean; // Admin can toggle this (derived from dates or manual)
  displayOnSite: boolean; // If true, show in user-facing coupon list/popup
  createdAt: any; // Firestore Timestamp
}
