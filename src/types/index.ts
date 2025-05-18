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

// This type is used for items *within* the cart, including quantity and selections
export interface CartItemData extends Omit<Product, 'id'| 'reviews' | 'averageRating' | 'reviewCount' | 'tags'> {
  // id here will be the Firestore document ID of the cart item itself
  // We need to store product's original ID separately if cart item ID is composite
  id: string; // This should be the cart item's unique ID (e.g., productId_size_color)
  productId: string; // The actual ID of the product
  quantity: number;
  selectedSize: string;
  selectedColor?: string | null;
  addedAt?: any; // Firestore Timestamp
  cartItemId?: string; // Explicitly to store the composite key if needed for easy reference
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
  // cart?: CartItemData[]; // Cart will now be a subcollection
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
  expiryDate?: any; // Firestore Timestamp or null
  minPurchaseAmount?: number; // Optional minimum purchase to apply coupon
  isActive: boolean; // Admin can toggle this
  displayOnSite: boolean; // If true, show in user-facing coupon list/popup
  createdAt?: any; // Firestore Timestamp
}