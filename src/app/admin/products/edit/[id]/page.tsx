
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
import { ArrowLeft, Save, UploadCloud, Loader2, AlertTriangle, Edit, XCircle, Trash2, Shirt, AppWindow } from 'lucide-react'; // Added Shirt, AppWindow
import { useToast } from '@/hooks/use-toast';
import type { Product, ProductVariant } from '@/types';
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

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

type ProductEditFormData = Omit<Product, 'id' | 'createdAt' | 'images' | 'variants' | 'offerStartDate' | 'offerEndDate'> & {
  tags?: string;
  additionalImagesString?: string; // For comma-separated URLs of additional images
  offerStartDateInput?: string;
  offerEndDateInput?: string;
};

const formatDateForInput = (date: any): string => {
    if (!date) return '';
    try {
        const d = date instanceof Timestamp ? date.toDate() : new Date(date);
        if (isNaN(d.getTime())) return '';
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
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // For main image preview
  const [mainImageFile, setMainImageFile] = useState<File | null>(null); // For new main image file
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setIsLoading(true); setError(null);
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
              category: productData.category || '',
              brand: productData.brand,
              tags: productData.tags?.join(', ') || '',
              sku: productData.sku,
              dataAiHint: productData.dataAiHint,
              additionalImagesString: productData.images?.filter(img => img !== productData.imageUrl).join('\n') || '', // Use newline for textarea
              offerStartDateInput: formatDateForInput(productData.offerStartDate),
              offerEndDateInput: formatDateForInput(productData.offerEndDate),
            });
            setVariants(productData.variants || [{ size: '', stock: 0, sku: '' }]);
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
      setError("No product ID provided."); setIsLoading(false);
    }
  }, [productId, toast]);

  const handleRemoveMainImage = () => {
    setImagePreview(null); setMainImageFile(null);
    setFormData(prev => ({ ...prev, imageUrl: '', dataAiHint: '' }));
    const imageInput = document.getElementById('mainImageFile') as HTMLInputElement;
    if (imageInput) imageInput.value = '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'originalPrice' ? parseFloat(value) || (name === 'originalPrice' ? undefined : 0) : value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]; setMainImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string; setImagePreview(dataUrl);
        setFormData(prev => ({ ...prev, imageUrl: dataUrl, dataAiHint: prev?.dataAiHint || file.name.split('.')[0].substring(0, 20).replace(/[^a-zA-Z0-9 ]/g, "") || "product image" }));
      };
      reader.readAsDataURL(file);
    }
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

  const addVariant = () => setVariants([...variants, { size: '', stock: 0, sku: '' }]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

  const loadDefaultSizes = (defaultSizes: string[]) => {
    setVariants(prevVariants => {
      const existingSizes = new Set(prevVariants.map(v => v.size.trim().toUpperCase()));
      const variantsToAdd = defaultSizes
        .filter(size => !existingSizes.has(size.trim().toUpperCase()))
        .map(size => ({ size, stock: 0, sku: '' }));
      return [...prevVariants, ...variantsToAdd];
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!originalProduct || !formData) {
      toast({ title: "Error", description: "Product data not loaded.", variant: "destructive" }); return;
    }
    if (!formData.category) {
      toast({ title: "Category Required", description: "Please select a category.", variant: "destructive" }); return;
    }
    if (variants.some(v => !v.size.trim() || v.stock < 0)) {
        toast({ title: "Invalid Variants", description: "All variants must have a size and non-negative stock.", variant: "destructive" }); return;
    }
    setIsSubmitting(true);

    let finalMainImageUrl = formData.imageUrl || originalProduct.imageUrl;
    const additionalImageUrls = formData.additionalImagesString?.split('\n').map(s => s.trim()).filter(s => s) || [];
    const finalImagesArray = [finalMainImageUrl, ...additionalImageUrls].filter(Boolean) as string[];

    const productDataToUpdate: Partial<Product> = {
      name: formData.name || originalProduct.name,
      price: Number(formData.price ?? originalProduct.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : (originalProduct.originalPrice ?? undefined),
      imageUrl: finalMainImageUrl,
      images: finalImagesArray.length > 0 ? finalImagesArray : (finalMainImageUrl ? [finalMainImageUrl] : []),
      description: formData.description || originalProduct.description,
      variants: variants.filter(v => v.size.trim()),
      category: formData.category || originalProduct.category,
      brand: formData.brand || originalProduct.brand,
      tags: formData.tags?.split(',').map(s => s.trim()).filter(s => s) || originalProduct.tags || [],
      sku: formData.sku || originalProduct.sku,
      dataAiHint: formData.dataAiHint || originalProduct.dataAiHint,
      offerStartDate: formData.offerStartDateInput ? new Date(formData.offerStartDateInput) : originalProduct.offerStartDate,
      offerEndDate: formData.offerEndDateInput ? new Date(formData.offerEndDateInput) : originalProduct.offerEndDate,
      // Keep existing review data
      averageRating: originalProduct.averageRating,
      reviewCount: originalProduct.reviewCount,
      reviews: originalProduct.reviews,
    };

    if (productDataToUpdate.originalPrice === undefined) delete (productDataToUpdate as Partial<Product>).originalPrice;
    if (productDataToUpdate.offerStartDate === undefined) delete (productDataToUpdate as Partial<Product>).offerStartDate;
    if (productDataToUpdate.offerEndDate === undefined) delete (productDataToUpdate as Partial<Product>).offerEndDate;


    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, productDataToUpdate);
      toast({ title: "Product Updated!", description: `${productDataToUpdate.name} has been updated.`, duration: 7000 });
      router.push('/admin/products/view');
    } catch (error: any) {
      console.error("Error updating product: ", error);
      toast({ title: "Error Updating Product", description: `Issue: ${error.message}`, variant: "destructive", duration: 7000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <CustomLoader />
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive">{error}</p>
        <Button asChild className="mt-4"><Link href="/admin/products/view">Back to Products</Link></Button>
      </div>
    );
  }
  if (!originalProduct) {
     return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground">Product data could not be loaded.</p>
         <Button asChild className="mt-4"><Link href="/admin/products/view">Back to Products</Link></Button>
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
                <p className="mt-1 text-md text-muted-foreground">Modifying: {originalProduct.name}</p>
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
                <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required className="text-base h-11"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" name="brand" value={formData.brand || ''} onChange={handleChange} className="text-base h-11"/>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} required rows={5} className="text-base"/>
            </div>

            {/* Price Fields */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price (₹)</Label>
                <Input id="price" name="price" type="number" value={formData.price ?? ''} onChange={handleChange} required step="0.01" min="0" className="text-base h-11"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (₹, Optional)</Label>
                <Input id="originalPrice" name="originalPrice" type="number" value={formData.originalPrice || ''} onChange={handleChange} step="0.01" min="0" className="text-base h-11"/>
              </div>
            </div>
            
            {/* Category and SKU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category || ''} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="h-11 text-base"><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>{productCategories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">Main SKU (Optional)</Label>
                <Input id="sku" name="sku" value={formData.sku || ''} onChange={handleChange} className="text-base h-11"/>
              </div>
            </div>

            {/* Main Image */}
            <div className="space-y-2">
              <Label htmlFor="mainImageFile">Change Main Product Image (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input id="mainImageFile" name="mainImageFile" type="file" accept="image/*" onChange={handleImageFileChange} className="text-base h-11 flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                <UploadCloud className="h-6 w-6 text-muted-foreground"/>
              </div>
              {imagePreview && (
                <div className="mt-4 p-2 border border-dashed border-border rounded-md inline-block relative">
                  <p className="text-xs text-muted-foreground mb-1">{mainImageFile ? "New Image Preview:" : "Current Main Image:"}</p>
                  <Image src={imagePreview} alt="Product Preview" width={200} height={266} className="object-contain rounded-md"/>
                  <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 bg-red-500/70 text-white hover:bg-red-600" onClick={handleRemoveMainImage}><XCircle className="h-4 w-4" /></Button>
                </div>
              )}
            </div>
             <div className="space-y-2">
                <Label htmlFor="dataAiHint">AI Hint for Main Image</Label>
                <Input id="dataAiHint" name="dataAiHint" value={formData.dataAiHint || ''} onChange={handleChange} className="text-base h-11"/>
                 <p className="text-xs text-muted-foreground">Max 2 words.</p>
            </div>

            {/* Additional Image URLs (Textarea for new lines) */}
            <div className="space-y-2">
              <Label htmlFor="additionalImagesString">Additional Image URLs (one URL per line)</Label>
              <Textarea id="additionalImagesString" name="additionalImagesString" value={formData.additionalImagesString || ''} onChange={handleChange} placeholder="https://url1.png\nhttps://url2.jpg" rows={3} className="text-base"/>
              <p className="text-xs text-muted-foreground">Externally hosted image URLs. The main image can be changed via the uploader above.</p>
            </div>

            {/* Product Variants */}
            <div className="space-y-4 p-4 border border-border/60 rounded-lg">
              <Label className="text-lg font-semibold">Product Variants (Sizes & Stock)</Label>
               <div className="flex gap-2 mb-3">
                <Button type="button" variant="outline" size="sm" onClick={() => loadDefaultSizes(defaultShirtSizes)}>
                    <Shirt className="mr-2 h-4 w-4"/> Load Shirt Sizes
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => loadDefaultSizes(defaultPantSizes)}>
                    <AppWindow className="mr-2 h-4 w-4"/> Load Pant Sizes
                </Button>
              </div>
              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end p-3 border border-border/50 rounded-md">
                  <div className="space-y-1">
                    <Label htmlFor={`variant-size-${index}`}>Size</Label>
                    <Input id={`variant-size-${index}`} value={variant.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} className="text-base h-10"/>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`variant-stock-${index}`}>Stock</Label>
                    <Input id={`variant-stock-${index}`} type="number" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} min="0" className="text-base h-10"/>
                  </div>
                   <div className="space-y-1">
                    <Label htmlFor={`variant-sku-${index}`}>Variant SKU (Optional)</Label>
                    <Input id={`variant-sku-${index}`} value={variant.sku || ''} onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} className="text-base h-10"/>
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeVariant(index)} className="h-10 w-10 sm:mt-0 mt-3 self-end"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addVariant} className="mt-2">Add Variant</Button>
            </div>

            {/* Tags and Offer Dates */}
             <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated, Optional)</Label>
                <Input id="tags" name="tags" value={formData.tags || ''} onChange={handleChange} className="text-base h-11"/>
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
                {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Updating...</> : <><Save className="mr-2 h-5 w-5" /> Save Changes</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
