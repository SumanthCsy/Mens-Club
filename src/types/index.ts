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
  offerStartDate?: any; // Firestore Timestamp or string
  offerEndDate?: any;   // Firestore Timestamp or string
}

export interface CartItemData {
  // Fields from Product that are relevant for the cart
  id: string;           // This is the composite cart item ID (e.g., productId_size) for Firestore
  productId: string;    // The original product ID
  name: string;
  price: number;
  originalPrice?: number | null; // From Product, explicitly allow null
  imageUrl: string;
  stock?: number | null;       // From Product, explicitly allow null
  dataAiHint?: string | null;  // From Product, explicitly allow null
  sku?: string | null;         // From Product, explicitly allow null

  // Cart-specific fields
  quantity: number;
  selectedSize: string;
  selectedColor?: string | null;
  addedAt?: any; // Firestore Timestamp

  // Offer dates, if they are to be stored with the cart item
  offerStartDate?: any | null;
  offerEndDate?: any | null;
}


export interface UserData {
  uid: string;
  email: string;
  fullName?: string;
  mobileNumber?: string;
  role: 'user' | 'admin';
  memberSince?: string; // ISO string or Firestore Timestamp
  avatarUrl?: string | null;
  defaultShippingAddress?: ShippingAddress;
}

export interface OrderItem {
  // id field here refers to the product's ID
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
  id?: string; // Firestore document ID
  userId: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount?: number | null;
  appliedCouponCode?: string | null;
  grandTotal: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: any; // Firestore Timestamp
  cancellationReason?: string;
  cancelledBy?: 'user' | 'store';
}

export interface PaymentSettings {
  enableCOD: boolean;
  enableOnlinePayments: boolean;
  upiId?: string;
  qrCodeUrl?: string; // Can be a data URI or a hosted image URL
}

export interface ThemeSettings {
  selectedColor: string;
  displayMode: 'light' | 'dark';
}

export interface StoreSettings {
  paymentConfig?: PaymentSettings;
  themeConfig?: ThemeSettings;
  // Potentially other store-wide settings
}

export interface Coupon {
  id?: string; // Firestore document ID
  code: string; // The coupon code itself, e.g., SUMMER20
  discountType: 'percentage' | 'fixed'; // Type of discount
  discountValue: number; // Value of the discount (e.g., 20 for 20% or 200 for ₹200)
  expiryDate?: any | null; // Firestore Timestamp, Date object, or null
  minPurchaseAmount?: number; // Optional minimum purchase to apply coupon
  isActive: boolean; // Admin can toggle this
  displayOnSite: boolean; // If true, show in user-facing coupon list/popup
  createdAt?: any; // Firestore Timestamp
}
