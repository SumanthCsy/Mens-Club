
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, UploadCloud, Loader2, AlertTriangle, Edit, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types';
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { format } from 'date-fns'; // For date formatting

type ProductEditFormData = Omit<Product, 'id' | 'sizes' | 'colors' | 'tags' | 'images' | 'averageRating' | 'reviewCount' | 'reviews' | 'offerStartDate' | 'offerEndDate'> & {
  sizes: string;
  colors?: string;
  tags?: string;
  additionalImagesString?: string;
  offerStartDateInput?: string;
  offerEndDateInput?: string;
};

const productCategories = [
  "New Arrivals",
  "Formals & Casuals",
  "Trendy",
  "Jeans",
  "T-shirts",
  "Others",
  "Limited Time Offers"
];

const formatDateForInput = (date: any): string => {
    if (!date) return '';
    try {
        const d = date instanceof Timestamp ? date.toDate() : new Date(date);
        if (isNaN(d.getTime())) return '';
        // Format to "yyyy-MM-ddTHH:mm" which is required by datetime-local
        return format(d, "yyyy-MM-dd'T'HH:mm");
    } catch (error) {
        console.warn("Error formatting date for input:", date, error);
        return '';
    }
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

            setFormData({
              name: productData.name,
              price: productData.price,
              originalPrice: productData.originalPrice,
              imageUrl: productData.imageUrl,
              description: productData.description,
              sizes: productData.sizes?.join(', ') || '',
              colors: productData.colors?.join(', ') || '',
              category: productData.category || '',
              brand: productData.brand,
              stock: productData.stock,
              tags: productData.tags?.join(', ') || '',
              sku: productData.sku,
              dataAiHint: productData.dataAiHint,
              additionalImagesString: productData.images?.filter(img => img !== productData.imageUrl).join(', ') || '',
              offerStartDateInput: formatDateForInput(productData.offerStartDate),
              offerEndDateInput: formatDateForInput(productData.offerEndDate),
            });
            setImagePreview(productData.imageUrl);
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

  const handleRemoveMainImage = () => {
    setImagePreview(null);
    setMainImageFile(null);
    setFormData(prev => ({ ...prev, imageUrl: '', dataAiHint: '' }));
    const imageInput = document.getElementById('mainImageFile') as HTMLInputElement;
    if (imageInput) {
        imageInput.value = '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'price' || name === 'originalPrice' || name === 'stock')
               ? parseFloat(value) || (name === 'originalPrice' ? undefined : 0)
               : value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setMainImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        setFormData(prev => ({
          ...prev,
          imageUrl: dataUrl, // Important: update formData.imageUrl for saving
          dataAiHint: prev?.dataAiHint || file.name.split('.')[0].substring(0, 20).replace(/[^a-zA-Z0-9 ]/g, "") || "product image",
        }));
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!originalProduct || !formData) {
      toast({ title: "Error", description: "Product data not fully loaded.", variant: "destructive"});
      return;
    }
    if (!formData.category) {
      toast({
        title: "Category Required",
        description: "Please select a product category.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);

    let finalMainImageUrl = formData.imageUrl || originalProduct.imageUrl;
    // If mainImageFile exists, it means a new image was selected,
    // and imagePreview (which becomes formData.imageUrl) holds its data URL.
    // So, finalMainImageUrl is already correctly set from formData.imageUrl.

    const additionalImageUrls = formData.additionalImagesString?.split(',').map(s => s.trim()).filter(s => s) || [];
    const finalImagesArray = [finalMainImageUrl, ...additionalImageUrls].filter(Boolean) as string[];


    const productDataToUpdate: Partial<Product> = {
      name: formData.name || originalProduct.name,
      price: Number(formData.price ?? originalProduct.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : (originalProduct.originalPrice ?? undefined),
      imageUrl: finalMainImageUrl,
      images: finalImagesArray.length > 0 ? finalImagesArray : (finalMainImageUrl ? [finalMainImageUrl] : []),
      description: formData.description || originalProduct.description,
      sizes: formData.sizes?.split(',').map(s => s.trim()).filter(s => s) || originalProduct.sizes,
      colors: formData.colors?.split(',').map(s => s.trim()).filter(s => s) || originalProduct.colors || [],
      category: formData.category || originalProduct.category,
      brand: formData.brand || originalProduct.brand,
      stock: Number(formData.stock ?? originalProduct.stock),
      tags: formData.tags?.split(',').map(s => s.trim()).filter(s => s) || originalProduct.tags || [],
      sku: formData.sku || originalProduct.sku,
      dataAiHint: formData.dataAiHint || originalProduct.dataAiHint,
      // Keep existing review data
      averageRating: originalProduct.averageRating,
      reviewCount: originalProduct.reviewCount,
      reviews: originalProduct.reviews,
      offerStartDate: formData.offerStartDateInput ? new Date(formData.offerStartDateInput) : originalProduct.offerStartDate,
      offerEndDate: formData.offerEndDateInput ? new Date(formData.offerEndDateInput) : originalProduct.offerEndDate,
    };


    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, productDataToUpdate);
      toast({
        title: "Product Updated!",
        description: `${productDataToUpdate.name} has been successfully updated.`,
        duration: 7000,
      });
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
                <Select value={formData.category || ''} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="h-11 text-base">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <div className="mt-4 p-2 border border-dashed border-border rounded-md inline-block relative">
                  <p className="text-xs text-muted-foreground mb-1">{mainImageFile ? "New Image Preview:" : "Current Main Image:"}</p>
                  <Image
                    src={imagePreview}
                    alt="Product Preview"
                    width={200}
                    height={266}
                    className="object-contain rounded-md"
                  />
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 bg-red-500/70 text-white hover:bg-red-600"
                    onClick={handleRemoveMainImage}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="offerStartDateInput">Offer Start Date (Optional)</Label>
                <Input id="offerStartDateInput" name="offerStartDateInput" type="datetime-local" value={formData.offerStartDateInput || ''} onChange={handleChange} className="text-base h-11"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="offerEndDateInput">Offer End Date (Optional)</Label>
                <Input id="offerEndDateInput" name="offerEndDateInput" type="datetime-local" value={formData.offerEndDateInput || ''} onChange={handleChange} className="text-base h-11"/>
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
