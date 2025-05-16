// @/app/products/[id]/page.tsx
"use client"; 

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { ProductImageGallery } from '@/components/products/product-image-gallery';
import { SizeSelector } from '@/components/products/size-selector';
import { UserReviews } from '@/components/products/user-reviews';
import { RatingStars } from '@/components/shared/rating-stars';
import { Heart, Share2, ShoppingCart, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ProductCard } from '@/components/products/product-card'; 
import Link from 'next/link';
import { doc, getDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';


async function getProductById(productId: string): Promise<Product | null> {
  if (!productId) return null;
  try {
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      return { id: productSnap.id, ...productSnap.data() } as Product;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
}

// This component remains client-side for interactivity
function ProductDetailsClientContent({ initialProduct }: { initialProduct: Product | null }) {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const { toast } = useToast();
  const router = useRouter(); // Initialize router
  
  // Update selectedSize if product has sizes and one isn't already selected
  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product, selectedSize]);


  if (!product) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-2">Product Not Found</h1>
        <p className="text-lg text-muted-foreground">
          Sorry, we couldn't find the product you're looking for.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }
  
  // Related products would also be fetched from a database
  // For now, let's assume this is empty or fetched separately if needed
  const relatedProducts: Product[] = []; 

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      toast({
        title: "Size Required",
        description: "Please select a size before adding to cart.",
        variant: "destructive",
      });
      return;
    }
    console.log(`Added ${product.name} (Size: ${selectedSize || 'N/A'}) to cart.`);
    toast({
      title: "Added to Cart!",
      description: `${product.name} (Size: ${selectedSize || 'N/A'}) has been added to your cart.`,
      action: (
        <Button variant="outline" size="sm" onClick={() => router.push('/cart')}>
          View Cart
        </Button>
      ),
    });
  };

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <ProductImageGallery images={product.images || [product.imageUrl]} altText={product.name} mainImageHint={product.dataAiHint} />

        <div className="space-y-6">
          <div className="space-y-2">
            {product.brand && <p className="text-sm font-medium text-primary tracking-wide uppercase">{product.brand}</p>}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{product.name}</h1>
            <div className="flex items-center gap-3 pt-1">
              {product.averageRating && product.reviewCount && product.reviewCount > 0 ? (
                <>
                  <RatingStars rating={product.averageRating} size={20} />
                  <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">No reviews yet</span>
              )}
            </div>
          </div>
          
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold text-primary">₹{product.price.toFixed(2)}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-xl text-muted-foreground line-through">₹{product.originalPrice.toFixed(2)}</p>
            )}
          </div>

          {typeof product.stock === 'number' && product.stock > 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium">In Stock ({product.stock} available)</p>
            </div>
          ) : (
             <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm font-medium">Out of Stock</p>
            </div>
          )}

          <Separator />

          <p className="text-foreground/80 leading-relaxed text-base whitespace-pre-line">{product.description}</p>

          {product.sizes && product.sizes.length > 0 && (
            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
              className="my-6"
            />
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button size="lg" className="flex-1 text-base" onClick={handleAddToCart} disabled={!product || (typeof product.stock === 'number' && product.stock === 0)}>
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Button variant="outline" size="lg" className="flex-1 text-base">
              <Heart className="mr-2 h-5 w-5" /> Add to Wishlist
            </Button>
          </div>
          
          <div className="flex items-center justify-start gap-3 pt-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            {product.sku && <Badge variant="secondary">SKU: {product.sku}</Badge>}
          </div>
        </div>
      </div>

      <div className="mt-16 md:mt-24">
        <UserReviews reviews={product.reviews} averageRating={product.averageRating} reviewCount={product.reviewCount} />
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="mt-16 md:mt-24">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-8 text-center">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// This is the Server Component that fetches data
export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const productId = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setIsLoading(true);
        const fetchedProduct = await getProductById(productId);
        setProduct(fetchedProduct);
        setIsLoading(false);
      };
      fetchProduct();
    } else {
      setIsLoading(false); // No ID, no product to fetch
    }
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading product details...</p>
      </div>
    );
  }
  
  return <ProductDetailsClientContent initialProduct={product} />;
}
