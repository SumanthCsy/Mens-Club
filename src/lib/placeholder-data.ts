import type { Product, Review, CartItemData } from '@/types';

// All sample product, review, and cart item data has been removed.
// In a full-stack application, this data would be fetched from a database.

export const sampleProducts: Product[] = [];
export const sampleReviews: Review[] = [];
export const sampleCartItems: CartItemData[] = [];

// The getProductById function is removed as it relied on sampleProducts.
// Product fetching logic should be implemented in the respective components/pages
// to query a database.

// Sample orders are kept as a UI placeholder for src/app/profile/my-orders/page.tsx
// This can be removed if a purely empty state is preferred.
export const sampleOrders = [
  {
    id: "ORD-2024-001",
    date: "2024-07-20",
    total: 168.99,
    status: "Delivered",
    items: [
      { name: "Classic Oxford Shirt", quantity: 1, price: 79.99 },
      { name: "Slim-Fit Chinos", quantity: 1, price: 89.00 },
    ],
  },
  {
    id: "ORD-2024-002",
    date: "2024-07-25",
    total: 110.00,
    status: "Shipped",
    items: [{ name: "Merino Wool V-Neck Sweater", quantity: 1, price: 110.00 }],
  },
  {
    id: "ORD-2024-003",
    date: "2024-07-28",
    total: 65.00,
    status: "Processing",
    items: [{ name: "Designer Silk Tie", quantity: 1, price: 65.00 }],
  },
];
