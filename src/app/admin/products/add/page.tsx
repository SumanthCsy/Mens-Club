// @/app/admin/products/add/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Added for preview
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PackagePlus, Save, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types';

// ProductFormDataimageUrl is now expected to be a data URI after image selection
type ProductFormData = Omit<Product, 'id' | 'averageRating' | 'reviewCount' | 'reviews'> & {
  sizes: string;
  colors?: string;
  tags?: string;
  images?: string; 
};

const initialFormData: ProductFormData = {
  name: '',
  price: 0,
  originalPrice: undefined,
  imageUrl: '', // This will hold the data URI of the uploaded image
  images: '',
  description: '',
  sizes: '',
  colors: '',
  category: '',
  brand: '',
  stock: 0,
  tags: '',
  sku: '',
  dataAiHint: '',
};

export default function AddProductPage() {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'imageFile' && e.target instanceof HTMLInputElement && e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setImagePreview(dataUrl);
          setFormData(prev => ({
            ...prev,
            imageUrl: dataUrl, // Store data URL in formData for the main image
          }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'price' || name === 'originalPrice' || name === 'stock' ? parseFloat(value) || 0 : value,
      }));
    }
  };
  
  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This handler is for the comma-separated URLs, not file uploads for additional images (yet)
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      toast({
        title: "Image Required",
        description: "Please upload a main product image.",
        variant: "destructive",
      });
      return;
    }

    const productDataToSave: Product = {
      ...formData,
      id: new Date().toISOString(), 
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      stock: Number(formData.stock),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
      colors: formData.colors?.split(',').map(s => s.trim()).filter(s => s) || [],
      tags: formData.tags?.split(',').map(s => s.trim()).filter(s => s) || [],
      // If additional images field is empty but main image exists, use main image as the primary in 'images' array
      images: formData.images?.split(',').map(s => s.trim()).filter(s => s).length 
              ? formData.images.split(',').map(s => s.trim()).filter(s => s) 
              : (formData.imageUrl ? [formData.imageUrl] : []),
    };

    console.log("Product Data to Save (includes image as data URL):", productDataToSave);
    toast({
      title: "Product Submitted (Simulated)",
      description: `${productDataToSave.name} has been submitted. Check console for data. Image is included as a data URL.`,
      duration: 7000,
    });
    // Reset form - including image preview
    // setFormData(initialFormData);
    // setImagePreview(null);
  };

  return (
    <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-3">
            <PackagePlus className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Add New Product</h1>
                <p className="mt-1 text-md text-muted-foreground">Fill in the details for the new product.</p>
            </div>
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Enter all necessary details for the product.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Classic Oxford Shirt" required className="text-base h-11"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g., Club Essentials" className="text-base h-11"/>
              </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Detailed product description..." required rows={5} className="text-base"/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="e.g., 2999.00" required step="0.01" className="text-base h-11"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (₹, Optional)</Label>
                <Input id="originalPrice" name="originalPrice" type="number" value={formData.originalPrice || ''} onChange={handleChange} placeholder="e.g., 3999.00" step="0.01" className="text-base h-11"/>
              </div>
               <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="e.g., 50" required className="text-base h-11"/>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Shirts, Trousers" className="text-base h-11"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="e.g., MENS-OXF-001" className="text-base h-11"/>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageFile">Main Product Image</Label>
              <div className="flex items-center gap-4">
                <Input 
                  id="imageFile" 
                  name="imageFile" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleChange} 
                  required 
                  className="text-base h-11 flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                <UploadCloud className="h-6 w-6 text-muted-foreground"/>
              </div>
              {imagePreview && (
                <div className="mt-4 p-2 border border-dashed border-border rounded-md inline-block">
                  <Image
                    src={imagePreview}
                    alt="Product Preview"
                    width={200}
                    height={266} // Assuming a 3:4 aspect ratio for preview
                    className="object-contain rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Additional Image URLs (comma-separated)</Label>
              <Input 
                id="images" 
                name="images" 
                value={formData.images || ''} 
                onChange={handleAdditionalImagesChange} // Use specific handler for this field
                placeholder="url1.png, url2.png, ..." 
                className="text-base h-11"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                    <Input id="sizes" name="sizes" value={formData.sizes} onChange={handleChange} placeholder="S, M, L, XL" required className="text-base h-11"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="colors">Colors (comma-separated, Optional)</Label>
                    <Input id="colors" name="colors" value={formData.colors} onChange={handleChange} placeholder="White, Blue, Black" className="text-base h-11"/>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated, Optional)</Label>
                    <Input id="tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="formal, cotton, new arrival" className="text-base h-11"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dataAiHint">AI Hint for Images (Optional)</Label>
                    <Input id="dataAiHint" name="dataAiHint" value={formData.dataAiHint} onChange={handleChange} placeholder="e.g., men shirt" className="text-base h-11"/>
                </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" className="text-base">
                <Save className="mr-2 h-5 w-5" /> Save Product
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <p className="mt-8 text-sm text-muted-foreground text-center">
        Note: Product saving is currently simulated. Data will be logged to the console.
        Full database integration is required to make products live on the website.
      </p>
    </div>
  );
}

    