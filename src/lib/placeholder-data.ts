import type { Product, Review, CartItemData } from '@/types';

// All sample product, review, and cart item data has been removed.
// In a full-stack application, this data would be fetched from a database.

export const sampleProducts: Product[] = [];
export const sampleReviews: Review[] = [];
export const sampleCartItems: CartItemData[] = [];

// The getProductById function is removed as it relied on sampleProducts.
// Product fetching logic should be implemented in the respective components/pages
// to query a database.

// Sample orders are also removed to reflect a true empty state if no orders exist.
export const sampleOrders = [];
