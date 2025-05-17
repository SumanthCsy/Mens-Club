
// @/app/products/page.tsx
import { ProductCard } from '@/components/products/product-card';
import type { Product } from '@/types';
import { collection, getDocs, query, orderBy, where, QueryConstraint } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { ProductFilters } from '@/components/products/product-filters';
import { Separator } from '@/components/ui/separator';
import { PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button'; // For pagination

export const metadata = {
  title: 'All Products | Mens Club Keshavapatnam',
  description: 'Browse our full collection of premium men\'s fashion.',
};

export const revalidate = 60;

const productCategories = [
  "New Arrivals",
  "Formals & Casuals",
  "Trendy",
  "Jeans",
  "T-shirts",
  "Others",
  "Limited Time Offers"
];

async function getProducts(category?: string, sortBy?: string): Promise<Product[]> {
  try {
    const productsCol = collection(db, "products");
    const constraints: QueryConstraint[] = [];

    if (category && category !== "All Categories") {
      constraints.push(where("category", "==", category));
    }

    // Default sort by name if no specific sort is applied or if it's an invalid sort
    let sortField = "name";
    let sortDirection: "asc" | "desc" = "asc";

    if (sortBy === "newest") {
      // Assuming you add a 'createdAt' timestamp field to your products for "newest"
      // For now, if 'createdAt' doesn't exist, it will default to name sort.
      // Add: constraints.push(orderBy("createdAt", "desc"));
      // Temporarily sort by name descending as a proxy for newest if no createdAt
      sortField = "name"; 
      sortDirection = "desc";
    } else if (sortBy === "price-asc") {
      sortField = "price";
      sortDirection = "asc";
    } else if (sortBy === "price-desc") {
      sortField = "price";
      sortDirection = "desc";
    }
    // Add other sort options like averageRating if needed

    constraints.push(orderBy(sortField, sortDirection));

    const q = query(productsCol, ...constraints);
    const productSnapshot = await getDocs(q);
    const productList = productSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
    return productList;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: {
    category?: string;
    sortBy?: string;
    // Add other potential searchParams like page, etc.
  };
}) {
  const currentCategory = searchParams?.category || "All Categories";
  const currentSortBy = searchParams?.sortBy || "featured"; // Default sort
  const products = await getProducts(currentCategory, currentSortBy);

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          {currentCategory === "All Categories" ? "Our Collection" : currentCategory}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover meticulously crafted pieces designed for the modern man. Explore a wide range of apparel and accessories.
        </p>
      </div>

      <ProductFilters categories={["All Categories", ...productCategories]} />
      
      <Separator className="my-8" />

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <PackageSearch className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-3">No Products Found</h2>
          <p className="text-muted-foreground">
            No products match your current filters. Try a different category or check back later.
          </p>
        </div>
      )}

      {/* Pagination (Placeholder) */}
      {products.length > 0 && (
        <div className="mt-12 flex justify-center">
          <div className="flex gap-2">
            <Button variant="outline" disabled>Previous</Button>
            <Button variant="outline">1</Button>
            <Button variant="outline" disabled>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
