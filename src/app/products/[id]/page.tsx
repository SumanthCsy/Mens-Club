
// @/app/products/[id]/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { ProductImageGallery } from '@/components/products/product-image-gallery';
import { SizeSelector } from '@/components/products/size-selector';
import { UserReviews } from '@/components/products/user-reviews';
import { RatingStars } from '@/components/shared/rating-stars';
import { Heart, Share2, ShoppingCart, CheckCircle, AlertTriangle, Loader2, Percent } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ProductCard } from '@/components/products/product-card';
import Link from 'next/link';
import { doc, onSnapshot, Unsubscribe, Timestamp } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context'; // Import useWishlist
import { OfferCountdownTimer } from '@/components/products/OfferCountdownTimer';

function ProductDetailsClientContent({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isProductInWishlist } = useWishlist(); // Get wishlist methods

  const isWishlisted = product ? isProductInWishlist(product.id) : false;

  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product, selectedSize]);

  useEffect(() => {
    if (!productId) {
      setError("Product ID is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const productRef = doc(db, "products", productId);

    const unsubscribe: Unsubscribe = onSnapshot(productRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProduct({
            id: docSnap.id,
            ...data,
            offerStartDate: data.offerStartDate,
            offerEndDate: data.offerEndDate,
        } as Product);
      } else {
        setError("Product not found.");
        setProduct(null);
      }
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching product details with onSnapshot:", err);
      setError("Failed to load product details in real-time.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [productId]);

  const discountPercentage = useMemo(() => {
    if (product && product.originalPrice && product.price && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a size before adding to cart.",
        variant: "destructive",
      });
      return;
    }
    if (typeof product.stock === 'number' && product.stock < 1) {
      toast({ title: "Out of Stock", description: "This item is currently out of stock.", variant: "destructive"});
      return;
    }
    addToCart(product, selectedSize || (product.sizes?.[0] || 'N/A'));
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-2">{error}</h1>
        <p className="text-lg text-muted-foreground">
          Sorry, we couldn't find or load the product you're looking for.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold text-muted-foreground mb-2">Product Unavailable</h1>
         <Button asChild className="mt-6">
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  const relatedProducts: Product[] = [];

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
              <>
                <p className="text-xl text-muted-foreground line-through">₹{product.originalPrice.toFixed(2)}</p>
                {discountPercentage > 0 && (
                  <Badge variant="destructive" className="text-sm">
                    <Percent className="mr-1 h-3.5 w-3.5" /> {discountPercentage}% OFF
                  </Badge>
                )}
              </>
            )}
          </div>

          {(product.offerStartDate || product.offerEndDate) && (
            <OfferCountdownTimer offerStartDate={product.offerStartDate} offerEndDate={product.offerEndDate} className="my-3" />
          )}

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
            <Button variant="outline" size="lg" className="flex-1 text-base" onClick={handleToggleWishlist}>
              <Heart className={`mr-2 h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
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

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const productId = params.id;
  return <ProductDetailsClientContent productId={productId} />;
}
