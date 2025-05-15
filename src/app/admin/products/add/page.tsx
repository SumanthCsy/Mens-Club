// @/app/admin/products/add/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PackagePlus, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types';

type ProductFormData = Omit<Product, 'id' | 'averageRating' | 'reviewCount' | 'reviews'> & {
  // Representing arrays as comma-separated strings for simplicity in form
  sizes: string;
  colors?: string;
  tags?: string;
  images?: string; // Comma-separated image URLs
};

const initialFormData: ProductFormData = {
  name: '',
  price: 0,
  originalPrice: undefined,
  imageUrl: '',
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
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'originalPrice' || name === 'stock' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Convert comma-separated strings back to arrays for the actual Product type
    const productDataToSave: Product = {
      ...formData,
      id: new Date().toISOString(), // Placeholder ID
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      stock: Number(formData.stock),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
      colors: formData.colors?.split(',').map(s => s.trim()).filter(s => s) || [],
      tags: formData.tags?.split(',').map(s => s.trim()).filter(s => s) || [],
      images: formData.images?.split(',').map(s => s.trim()).filter(s => s) || [formData.imageUrl], // Use main imageUrl if images field is empty
      // averageRating, reviewCount, reviews would be handled by backend or reviews system
    };

    console.log("Product Data to Save:", productDataToSave);
    toast({
      title: "Product Submitted (Simulated)",
      description: `${productDataToSave.name} has been submitted. Check console for data.`,
    });
    // Here you would typically send the data to your backend/Firebase
    // setFormData(initialFormData); // Optionally reset form
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
              <Label htmlFor="imageUrl">Main Image URL</Label>
              <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://placehold.co/600x800.png" required className="text-base h-11"/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Additional Image URLs (comma-separated)</Label>
              <Input id="images" name="images" value={formData.images} onChange={handleChange} placeholder="url1.png, url2.png, ..." className="text-base h-11"/>
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
    </div>
  );
}
