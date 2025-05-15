// @/app/products/[id]/page.tsx
"use client"; 

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
// import { getProductById, sampleProducts } from '@/lib/placeholder-data'; // Removed sample data
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


function ProductDetailsClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    // In a real application, you would fetch the product from your backend/database here
    // For example:
    // async function fetchProduct() {
    //   try {
    //     const response = await fetch(`/api/products/${productId}`);
    //     if (!response.ok) throw new Error('Product not found');
    //     const data = await response.json();
    //     setProduct(data);
    //     if (data.sizes && data.sizes.length > 0) {
    //       setSelectedSize(data.sizes[0]);
    //     }
    //   } catch (error) {
    //     console.error("Failed to fetch product:", error);
    //     setProduct(null);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // }
    // fetchProduct();

    // Simulating no product found for now as placeholder data is removed
    setTimeout(() => {
      setProduct(null); 
      setIsLoading(false);
    }, 500); // Simulate network delay
    
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

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
    // Add to cart logic would interact with a cart state/API
    console.log(`Added ${product.name} (Size: ${selectedSize || 'N/A'}) to cart.`);
    toast({
      title: "Added to Cart!",
      description: `${product.name} (Size: ${selectedSize || 'N/A'}) has been added to your cart.`,
      action: (
        <Button variant="outline" size="sm" onClick={() => window.location.href = '/cart'}>
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
              {product.averageRating && product.reviewCount ? (
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

          {product.stock && product.stock > 0 ? (
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
            <Button size="lg" className="flex-1 text-base" onClick={handleAddToCart} disabled={!product || product.stock === 0}>
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


export default function ProductDetailsPage() {
  const params = useParams();
  const productId = typeof params.id === 'string' ? params.id : '';
  
  return <ProductDetailsClient productId={productId} />;
}
