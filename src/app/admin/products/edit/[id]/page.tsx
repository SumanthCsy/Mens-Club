
// @/app/admin/products/edit/[id]/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, UploadCloud, Loader2, AlertTriangle, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';

// Define a type for the form data, similar to AddProductPage but for editing
type ProductEditFormData = Omit<Product, 'id' | 'sizes' | 'colors' | 'tags' | 'images' | 'averageRating' | 'reviewCount' | 'reviews'> & {
  sizes: string; // Comma-separated string for form input
  colors?: string; // Comma-separated string
  tags?: string; // Comma-separated string
  additionalImagesString?: string; // Comma-separated string for additional image URLs
};


export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [formData, setFormData] = useState<Partial<ProductEditFormData>>({});
  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const productRef = doc(db, "products", productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            const productData = { id: productSnap.id, ...productSnap.data() } as Product;
            setOriginalProduct(productData);
            
            // Prepare form data from product data
            setFormData({
              name: productData.name,
              price: productData.price,
              originalPrice: productData.originalPrice,
              imageUrl: productData.imageUrl, // Keep existing imageUrl for preview
              description: productData.description,
              sizes: productData.sizes?.join(', ') || '',
              colors: productData.colors?.join(', ') || '',
              category: productData.category,
              brand: productData.brand,
              stock: productData.stock,
              tags: productData.tags?.join(', ') || '',
              sku: productData.sku,
              dataAiHint: productData.dataAiHint,
              // Filter out the main imageUrl from the images array for the additionalImagesString
              additionalImagesString: productData.images?.filter(img => img !== productData.imageUrl).join(', ') || '',
            });
            setImagePreview(productData.imageUrl); // Set initial image preview
          } else {
            setError("Product not found.");
            toast({ title: "Error", description: "Product not found.", variant: "destructive" });
          }
        } catch (err) {
          console.error("Error fetching product:", err);
          setError("Failed to fetch product details.");
          toast({ title: "Error", description: "Failed to load product details.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    } else {
      setError("No product ID provided.");
      setIsLoading(false);
    }
  }, [productId, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'price' || name === 'originalPrice' || name === 'stock') 
               ? parseFloat(value) || (name === 'originalPrice' ? undefined : 0) 
               : value,
    }));
  };
  
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setMainImageFile(file); // Store the file object
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl); // Update preview
        setFormData(prev => ({
          ...prev,
          // imageUrl will be updated with dataUrl on submit if mainImageFile exists
          dataAiHint: prev?.dataAiHint || file.name.split('.')[0].substring(0, 20).replace(/[^a-zA-Z0-9 ]/g, "") || "product image",
        }));
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!originalProduct) {
      toast({ title: "Error", description: "Original product data not loaded.", variant: "destructive"});
      return;
    }
    setIsSubmitting(true);

    let finalMainImageUrl = originalProduct.imageUrl; // Default to original image
    if (mainImageFile && imagePreview) { // If a new file was selected and preview exists
        finalMainImageUrl = imagePreview; // This is the data URI
    }

    const additionalImageUrls = formData.additionalImagesString?.split(',').map(s => s.trim()).filter(s => s) || [];
    const finalImagesArray = [finalMainImageUrl, ...additionalImageUrls].filter(Boolean) as string[];


    const productDataToUpdate: Partial<Product> = {
      name: formData.name || originalProduct.name,
      price: Number(formData.price ?? originalProduct.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : (originalProduct.originalPrice ?? undefined),
      imageUrl: finalMainImageUrl,
      images: finalImagesArray.length > 0 ? finalImagesArray : [finalMainImageUrl],
      description: formData.description || originalProduct.description,
      sizes: formData.sizes?.split(',').map(s => s.trim()).filter(s => s) || originalProduct.sizes,
      colors: formData.colors?.split(',').map(s => s.trim()).filter(s => s) || originalProduct.colors || [],
      category: formData.category || originalProduct.category,
      brand: formData.brand || originalProduct.brand,
      stock: Number(formData.stock ?? originalProduct.stock),
      tags: formData.tags?.split(',').map(s => s.trim()).filter(s => s) || originalProduct.tags || [],
      sku: formData.sku || originalProduct.sku,
      dataAiHint: formData.dataAiHint || originalProduct.dataAiHint,
      // Retain existing review data, not editable in this form
      averageRating: originalProduct.averageRating,
      reviewCount: originalProduct.reviewCount,
      reviews: originalProduct.reviews,
    };
    

    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, productDataToUpdate);
      toast({
        title: "Product Updated!",
        description: `${productDataToUpdate.name} has been successfully updated.`,
        duration: 7000,
      });
      // Optionally, refresh originalProduct state or navigate
      // setOriginalProduct(prev => ({...prev, ...productDataToUpdate} as Product));
      router.push('/admin/products/view'); 
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({
        title: "Error Updating Product",
        description: "There was an issue updating the product. Check console.",
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
  
  if (!originalProduct) {
     return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground">Product data could not be loaded.</p>
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
                  Modify details for: {originalProduct.name}
                </p>
            </div>
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Update the product details below. Upload a new main image if needed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} placeholder="e.g., Classic Oxford Shirt" required className="text-base h-11"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" name="brand" value={formData.brand || ''} onChange={handleChange} placeholder="e.g., Club Essentials" className="text-base h-11"/>
              </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} placeholder="Detailed product description..." required rows={5} className="text-base"/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" name="price" type="number" value={formData.price ?? ''} onChange={handleChange} placeholder="e.g., 2999.00" required step="0.01" className="text-base h-11"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (₹, Optional)</Label>
                <Input id="originalPrice" name="originalPrice" type="number" value={formData.originalPrice || ''} onChange={handleChange} placeholder="e.g., 3999.00" step="0.01" className="text-base h-11"/>
              </div>
               <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input id="stock" name="stock" type="number" value={formData.stock ?? ''} onChange={handleChange} placeholder="e.g., 50" required className="text-base h-11"/>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" value={formData.category || ''} onChange={handleChange} placeholder="e.g., Shirts, Trousers" className="text-base h-11"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" value={formData.sku || ''} onChange={handleChange} placeholder="e.g., MENS-OXF-001" className="text-base h-11"/>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mainImageFile">Change Main Product Image (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input 
                  id="mainImageFile" 
                  name="mainImageFile" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageFileChange} 
                  className="text-base h-11 flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                <UploadCloud className="h-6 w-6 text-muted-foreground"/>
              </div>
              {imagePreview && (
                <div className="mt-4 p-2 border border-dashed border-border rounded-md inline-block">
                  <p className="text-xs text-muted-foreground mb-1">{mainImageFile ? "New Image Preview:" : "Current Main Image:"}</p>
                  <Image
                    src={imagePreview}
                    alt="Product Preview"
                    width={200}
                    height={266} 
                    className="object-contain rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalImagesString">Additional Image URLs (comma-separated, optional)</Label>
              <Input 
                id="additionalImagesString" 
                name="additionalImagesString" 
                value={formData.additionalImagesString || ''}
                onChange={handleChange}
                placeholder="url1.png, url2.png, ..." 
                className="text-base h-11"
              />
              <p className="text-xs text-muted-foreground">Externally hosted image URLs. Main image can be changed above.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                    <Input id="sizes" name="sizes" value={formData.sizes || ''} onChange={handleChange} placeholder="S, M, L, XL" required className="text-base h-11"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="colors">Colors (comma-separated, Optional)</Label>
                    <Input id="colors" name="colors" value={formData.colors || ''} onChange={handleChange} placeholder="White, Blue, Black" className="text-base h-11"/>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated, Optional)</Label>
                    <Input id="tags" name="tags" value={formData.tags || ''} onChange={handleChange} placeholder="formal, cotton, new arrival" className="text-base h-11"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dataAiHint">AI Hint for Main Image</Label>
                    <Input id="dataAiHint" name="dataAiHint" value={formData.dataAiHint || ''} onChange={handleChange} placeholder="e.g., men shirt" className="text-base h-11"/>
                     <p className="text-xs text-muted-foreground">Used for image search if placeholders are needed. Max 2 words.</p>
                </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" className="text-base" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
