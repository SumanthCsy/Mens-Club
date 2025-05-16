
export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  avatarUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // For sales/discounts
  imageUrl: string; // Should ideally be a URL from Firebase Storage
  images?: string[]; // For product gallery, also ideally URLs
  description: string;
  sizes: string[];
  colors?: string[];
  category?: string;
  brand?: string;
  averageRating?: number;
  reviewCount?: number;
  reviews?: Review[];
  stock?: number; // Number of items in stock
  tags?: string[];
  sku?: string; // Stock Keeping Unit
  dataAiHint?: string; // For placeholder image search keywords
}

export interface CartItemData extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor?: string;
}

// For user data stored in Firestore
export interface UserData {
  uid: string;
  email: string;
  fullName?: string;
  mobileNumber?: string;
  role: 'user' | 'admin';
  memberSince?: string; 
  avatarUrl?: string; 
  // Add other fields as needed, e.g., shippingAddresses, orderHistoryIds
}
