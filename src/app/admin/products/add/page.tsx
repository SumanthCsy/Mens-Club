
// @/app/admin/products/add/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, PackagePlus, Save, UploadCloud, Loader2, XCircle, ImagePlus, Trash2, Shirt, AppWindow } from 'lucide-react'; // Added Shirt, AppWindow (placeholder for pants)
import { useToast } from '@/hooks/use-toast';
import type { Product, ProductVariant } from '@/types';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '@/lib/firebase';

const productCategories = [
  "New Arrivals",
  "Formals & Casuals",
  "Trendy",
  "Jeans",
  "T-shirts",
  "Others",
  "Limited Time Offers"
];

const defaultShirtSizes = ['S', 'M', 'L', 'XL', 'XXL'];
const defaultPantSizes = ['28', '30', '32', '34', '36', '38'];

type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'images' | 'variants'> & {
  tags?: string;
  offerStartDateInput?: string;
  offerEndDateInput?: string;
};

const initialFormData: ProductFormData = {
  name: '',
  price: 0,
  originalPrice: undefined,
  imageUrl: '',
  description: '',
  category: '',
  brand: '',
  tags: '',
  sku: '',
  dataAiHint: '',
  averageRating: 0,
  reviewCount: 0,
  reviews: [],
  offerStartDateInput: '',
  offerEndDateInput: '',
};

export default function AddProductPage() {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [variants, setVariants] = useState<ProductVariant[]>([{ size: '', stock: 0, sku: '' }]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRemoveMainImage = () => {
    setMainImagePreview(null);
    setMainImageFile(null);
    setFormData(prev => ({ ...prev, imageUrl: '', dataAiHint: '' }));
    const imageInput = document.getElementById('mainImageFile') as HTMLInputElement;
    if (imageInput) {
        imageInput.value = '';
    }
  };
  
  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
    setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setMainImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setMainImagePreview(dataUrl);
        setFormData(prev => ({
          ...prev,
          imageUrl: dataUrl,
          dataAiHint: prev.dataAiHint || file.name.split('.')[0].substring(0, 20).replace(/[^a-zA-Z0-9 ]/g, "") || "product",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAdditionalImageFiles(prev => [...prev, ...filesArray]);

      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAdditionalImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'originalPrice' ? parseFloat(value) || (name === 'originalPrice' ? undefined : 0) : value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: string | number) => {
    const newVariants = [...variants];
    if (field === 'stock') {
      newVariants[index][field] = Number(value) || 0;
    } else {
      newVariants[index][field] = value as string;
    }
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { size: '', stock: 0, sku: '' }]);
  };

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const loadDefaultSizes = (defaultSizes: string[]) => {
    setVariants(prevVariants => {
      const existingSizes = new Set(prevVariants.map(v => v.size.trim().toUpperCase()));
      const variantsToAdd = defaultSizes
        .filter(size => !existingSizes.has(size.trim().toUpperCase()))
        .map(size => ({ size, stock: 0, sku: '' }));
      return [...prevVariants, ...variantsToAdd];
    });
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!mainImageFile && !formData.imageUrl) {
      toast({ title: "Main Image Required", description: "Please upload a main product image.", variant: "destructive" });
      setIsSubmitting(false); return;
    }
    if (!formData.category) {
      toast({ title: "Category Required", description: "Please select a product category.", variant: "destructive" });
      setIsSubmitting(false); return;
    }
    if (variants.some(v => !v.size.trim() || v.stock < 0)) {
      toast({ title: "Invalid Variants", description: "All variants must have a size and non-negative stock.", variant: "destructive" });
      setIsSubmitting(false); return;
    }

    let finalMainImageUrl = formData.imageUrl;
    const productImages: string[] = [];
    if (finalMainImageUrl) productImages.push(finalMainImageUrl);
    productImages.push(...additionalImagePreviews.filter(url => url !== finalMainImageUrl));

    const productDataToSave: Omit<Product, 'id' | 'createdAt'> = {
      ...formData,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      imageUrl: finalMainImageUrl,
      images: productImages.length > 0 ? productImages : (finalMainImageUrl ? [finalMainImageUrl] : []),
      variants: variants.filter(v => v.size.trim()), // Ensure only variants with sizes are saved
      tags: formData.tags?.split(',').map(s => s.trim()).filter(s => s) || [],
      offerStartDate: formData.offerStartDateInput ? new Date(formData.offerStartDateInput) : undefined,
      offerEndDate: formData.offerEndDateInput ? new Date(formData.offerEndDateInput) : undefined,
    };
    // Remove undefined optional fields before saving
    if (productDataToSave.originalPrice === undefined) delete productDataToSave.originalPrice;
    if (productDataToSave.offerStartDate === undefined) delete productDataToSave.offerStartDate;
    if (productDataToSave.offerEndDate === undefined) delete productDataToSave.offerEndDate;


    try {
      const docRef = await addDoc(collection(db, "products"), {
        ...productDataToSave,
        createdAt: serverTimestamp()
      });
      toast({ title: "Product Added Successfully!", description: `${productDataToSave.name} has been saved.`, duration: 7000 });
      setFormData(initialFormData);
      setVariants([{ size: '', stock: 0, sku: '' }]);
      setMainImagePreview(null); setMainImageFile(null);
      setAdditionalImagePreviews([]); setAdditionalImageFiles([]);
      const mainImageInput = document.getElementById('mainImageFile') as HTMLInputElement; if (mainImageInput) mainImageInput.value = '';
      const additionalImagesInput = document.getElementById('additionalImagesFile') as HTMLInputElement; if (additionalImagesInput) additionalImagesInput.value = '';
    } catch (error: any) {
      console.error("Error adding product: ", error);
      toast({ title: "Error Saving Product", description: `There was an issue: ${error.message}`, variant: "destructive", duration: 7000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/products/view">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to View Products
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
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name and Brand */}
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

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Detailed product description..." required rows={5} className="text-base"/>
            </div>

            {/* Price Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price (₹)</Label>
                <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="e.g., 2999.00" required step="0.01" min="0" className="text-base h-11"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (₹, Optional)</Label>
                <Input id="originalPrice" name="originalPrice" type="number" value={formData.originalPrice || ''} onChange={handleChange} placeholder="e.g., 3999.00" step="0.01" min="0" className="text-base h-11"/>
              </div>
            </div>
            
            {/* Category and SKU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                 <Select value={formData.category} onValueChange={handleCategoryChange}>
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
                <Label htmlFor="sku">Main SKU (Optional)</Label>
                <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="e.g., MENS-OXF-001" className="text-base h-11"/>
              </div>
            </div>

            {/* Main Image */}
            <div className="space-y-2">
              <Label htmlFor="mainImageFile">Main Product Image</Label>
              <div className="flex items-center gap-4">
                <Input id="mainImageFile" name="mainImageFile" type="file" accept="image/*" onChange={handleMainImageChange} required={!mainImagePreview && !formData.imageUrl} className="text-base h-11 flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                <UploadCloud className="h-6 w-6 text-muted-foreground"/>
              </div>
              {mainImagePreview && (
                <div className="mt-4 p-2 border border-dashed border-border rounded-md inline-block relative">
                  <Image src={mainImagePreview} alt="Main Product Preview" width={200} height={266} className="object-contain rounded-md"/>
                  <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 bg-red-500/70 text-white hover:bg-red-600" onClick={handleRemoveMainImage}><XCircle className="h-4 w-4" /></Button>
                </div>
              )}
            </div>
             <div className="space-y-2">
                <Label htmlFor="dataAiHint">AI Hint for Main Image</Label>
                <Input id="dataAiHint" name="dataAiHint" value={formData.dataAiHint || ''} onChange={handleChange} placeholder="e.g., men shirt" className="text-base h-11"/>
                 <p className="text-xs text-muted-foreground">Used for image search if placeholders are needed. Max 2 words.</p>
            </div>

            {/* Additional Images */}
            <div className="space-y-2">
              <Label htmlFor="additionalImagesFile">Additional Product Images (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input id="additionalImagesFile" name="additionalImagesFile" type="file" accept="image/*" multiple onChange={handleAdditionalImagesChange} className="text-base h-11 flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                <ImagePlus className="h-6 w-6 text-muted-foreground"/>
              </div>
              {additionalImagePreviews.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {additionalImagePreviews.map((previewUrl, index) => (
                    <div key={index} className="p-2 border border-dashed border-border rounded-md inline-block relative">
                      <Image src={previewUrl} alt={`Additional Preview ${index + 1}`} width={100} height={133} className="object-contain rounded-md"/>
                      <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-5 w-5 bg-red-500/70 text-white hover:bg-red-600" onClick={() => handleRemoveAdditionalImage(index)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Variants (Sizes & Stock) */}
            <div className="space-y-4 p-4 border border-border/60 rounded-lg">
              <Label className="text-lg font-semibold">Product Variants (Sizes & Stock)</Label>
              <div className="flex gap-2 mb-3">
                <Button type="button" variant="outline" size="sm" onClick={() => loadDefaultSizes(defaultShirtSizes)}>
                    <Shirt className="mr-2 h-4 w-4"/> Load Shirt Sizes
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => loadDefaultSizes(defaultPantSizes)}>
                    <AppWindow className="mr-2 h-4 w-4"/> Load Pant Sizes {/* Using AppWindow as generic placeholder for pants icon */}
                </Button>
              </div>
              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end p-3 border border-border/50 rounded-md">
                  <div className="space-y-1">
                    <Label htmlFor={`variant-size-${index}`}>Size</Label>
                    <Input id={`variant-size-${index}`} value={variant.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} placeholder="e.g., M or 32" className="text-base h-10"/>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`variant-stock-${index}`}>Stock</Label>
                    <Input id={`variant-stock-${index}`} type="number" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} placeholder="e.g., 10" min="0" className="text-base h-10"/>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`variant-sku-${index}`}>Variant SKU (Optional)</Label>
                    <Input id={`variant-sku-${index}`} value={variant.sku || ''} onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} placeholder="e.g., SKU-M" className="text-base h-10"/>
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeVariant(index)} className="h-10 w-10 sm:mt-0 mt-3 self-end">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addVariant} className="mt-2">
                Add Another Variant
              </Button>
            </div>

            {/* Tags and Offer Dates */}
            <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated, Optional)</Label>
                <Input id="tags" name="tags" value={formData.tags || ''} onChange={handleChange} placeholder="formal, cotton, new arrival" className="text-base h-11"/>
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

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" className="text-base" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</> : <><Save className="mr-2 h-5 w-5" /> Save Product</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
