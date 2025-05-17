// @/components/home/featured-products.tsx
import { ProductCard } from '@/components/products/product-card';
import type { Product } from '@/types';
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from '@/lib/firebase';

// Revalidate every 60 seconds (or choose your preferred interval)
export const revalidate = 60; 

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const productsCol = collection(db, "products");
    // Fetch up to 12 products for the featured section
    const q = query(productsCol, orderBy("name"), limit(12)); 
    const productSnapshot = await getDocs(q);
    const productList = productSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
    return productList;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export async function FeaturedProducts() {
  const featured = await getFeaturedProducts();

  if (featured.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Featured Collection
          </h2>
          <p className="text-lg text-muted-foreground">
            No featured products available at the moment. Check back soon or add products through the admin panel!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Featured Collection
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked essentials for the discerning gentleman. Explore our latest and most popular items.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
