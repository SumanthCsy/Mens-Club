
export interface Review {
  id: string; // Can be auto-generated or productID + userID + timestamp
  userId: string;
  author: string; // User's display name or email
  rating: number; // 1-5
  comment: string;
  date: string; // ISO string
  avatarUrl?: string | null; // Allow null for avatarUrl
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // For sales/discounts
  imageUrl: string; // Main image URL (can be data URI temporarily or Firebase Storage URL)
  images?: string[]; // For product gallery, including main image + additional. All ideally URLs.
  description: string;
  sizes: string[];
  colors?: string[];
  category?: string;
  brand?: string;
  averageRating?: number; // This will be calculated client-side in UserReviews or by a Function
  reviewCount?: number;   // This will be calculated client-side in UserReviews or by a Function
  reviews?: Review[];     // Array of actual review objects
  stock?: number; // Number of items in stock
  tags?: string[];
  sku?: string; // Stock Keeping Unit
  dataAiHint?: string; // For placeholder image search keywords
  offerStartDate?: any; // Firestore ServerTimestamp or string for input
  offerEndDate?: any;   // Firestore ServerTimestamp or string for input
}

export interface CartItemData extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor?: string | null;
}

// For user data stored in Firestore
export interface UserData {
  uid: string;
  email: string;
  fullName?: string;
  mobileNumber?: string;
  role: 'user' | 'admin';
  memberSince?: string;
  avatarUrl?: string | null;
  defaultShippingAddress?: ShippingAddress; // Added for storing default address
}

// Types for Order and Shipping
export interface OrderItem {
  id: string; // Product ID
  name: string;
  quantity: number;
  price: number; // Price per unit at the time of order
  selectedSize: string;
  selectedColor: string | null; // Ensure it can be null
  imageUrl: string;
  sku: string | null; // Ensure it can be null
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2: string | null; // Ensure it can be null
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phoneNumber: string | null; // Ensure it can be null
  email: string; // Customer's email for shipping, might be different from auth email
}

export interface Order {
  id?: string; // Firestore will generate this if not provided when adding
  userId: string; // UID of the user who placed the order
  customerEmail: string; // Email of the user who placed the order (from shipping/auth)
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount?: number | null; // Optional discount amount, can be null
  grandTotal: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: any; // Firestore ServerTimestamp, will be resolved to Timestamp
  cancellationReason?: string;
  cancelledBy?: 'user' | 'store';
}

export interface PaymentSettings {
  enableCOD: boolean;
  enableOnlinePayments: boolean;
  upiId?: string;
  qrCodeUrl?: string; // Placeholder for QR code image URL
}

export interface ThemeSettings {
  selectedColor: string; // e.g., 'default', 'yellow', 'blue'
  displayMode: 'light' | 'dark';
}

// Combined store settings
export interface StoreSettings {
  paymentConfig?: PaymentSettings;
  themeConfig?: ThemeSettings;
  // Add other global settings here if needed
}
