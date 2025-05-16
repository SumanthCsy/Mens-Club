
// @/app/admin/products/edit/[id]/page.tsx
"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Loader2, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Product } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// For now, this page is a placeholder. It will fetch product data.
// The actual form and update logic will be implemented in a future step.

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const productRef = doc(db, "products", productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            setProduct({ id: productSnap.id, ...productSnap.data() } as Product);
          } else {
            setError("Product not found.");
          }
        } catch (err) {
          console.error("Error fetching product:", err);
          setError("Failed to fetch product details.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    } else {
      setError("No product ID provided.");
      setIsLoading(false);
    }
  }, [productId]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading product details for editing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive">{error}</p>
        <Button asChild className="mt-4">
          <Link href="/admin/products/view">Back to Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/products/view">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to View Products
          </Link>
        </Button>
         <div className="flex items-center gap-3">
            <Edit className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Edit Product</h1>
                <p className="mt-1 text-md text-muted-foreground">
                  Editing: {product ? product.name : `Product ID ${productId}`}
                </p>
            </div>
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <CardHeader>
          <CardTitle>Edit Product Details</CardTitle>
          <CardDescription>Modify the product information below. Full form coming soon.</CardDescription>
        </CardHeader>
        <CardContent>
          {product ? (
            <div>
              <p><strong>Name:</strong> {product.name}</p>
              <p><strong>Price:</strong> ₹{product.price.toFixed(2)}</p>
              <p><strong>Category:</strong> {product.category || 'N/A'}</p>
              <p className="mt-6 text-lg text-muted-foreground">
                Full editing form will be implemented here.
              </p>
            </div>
          ) : (
            <p>Product data could not be loaded.</p>
          )}
           <div className="flex justify-end pt-8">
              <Button size="lg" className="text-base" disabled>
                Save Changes (Soon)
              </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
