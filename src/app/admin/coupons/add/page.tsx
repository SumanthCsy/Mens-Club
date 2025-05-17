
// @/app/admin/coupons/add/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, TicketPlus, Save, Loader2, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Coupon } from '@/types';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '@/lib/firebase';

type CouponFormData = Omit<Coupon, 'id' | 'createdAt' | 'isActive'> & {
  expiryDateInput?: string; // For datetime-local input
};

const initialFormData: CouponFormData = {
  code: '',
  discountType: 'percentage',
  discountValue: 0,
  expiryDateInput: '',
  minPurchaseAmount: undefined,
  displayOnSite: false,
};

export default function AddCouponPage() {
  const [formData, setFormData] = useState<CouponFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || undefined : value),
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, displayOnSite: checked }));
  };

  const handleDiscountTypeChange = (value: 'percentage' | 'fixed') => {
    setFormData(prev => ({ ...prev, discountType: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.code.trim()) {
      toast({ title: "Coupon Code Required", description: "Please enter a coupon code.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (formData.discountValue <= 0) {
      toast({ title: "Invalid Discount Value", description: "Discount value must be greater than zero.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const couponDataToSave: Omit<Coupon, 'id'> = {
      code: formData.code.trim().toUpperCase(),
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      expiryDate: formData.expiryDateInput ? new Date(formData.expiryDateInput) : undefined,
      minPurchaseAmount: formData.minPurchaseAmount,
      displayOnSite: formData.displayOnSite,
      isActive: true, // New coupons are active by default, can be deactivated later
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "coupons"), couponDataToSave);
      toast({
        title: "Coupon Added Successfully!",
        description: `Coupon ${couponDataToSave.code} has been saved with ID: ${docRef.id}.`,
        duration: 7000,
      });
      setFormData(initialFormData); // Reset form
    } catch (error) {
      console.error("Error adding coupon: ", error);
      toast({
        title: "Error Saving Coupon",
        description: "There was an issue saving the coupon. Check console.",
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/coupons">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Coupons
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <TicketPlus className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Add New Coupon</h1>
            <p className="mt-1 text-md text-muted-foreground">Create a discount coupon for your store.</p>
          </div>
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <CardHeader>
          <CardTitle>Coupon Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code</Label>
              <Input id="code" name="code" value={formData.code} onChange={handleChange} placeholder="e.g., SUMMER20" required className="uppercase text-base h-11"/>
              <p className="text-xs text-muted-foreground">Customers will use this code at checkout. (Will be auto-uppercased)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select value={formData.discountType} onValueChange={handleDiscountTypeChange}>
                  <SelectTrigger className="h-11 text-base">
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountValue">Discount Value</Label>
                <Input 
                  id="discountValue" 
                  name="discountValue" 
                  type="number" 
                  value={formData.discountValue} 
                  onChange={handleChange} 
                  placeholder={formData.discountType === 'percentage' ? "e.g., 10 for 10%" : "e.g., 100 for ₹100"} 
                  required 
                  step="0.01"
                  min="0.01"
                  className="text-base h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="expiryDateInput">Expiry Date (Optional)</Label>
                <Input id="expiryDateInput" name="expiryDateInput" type="datetime-local" value={formData.expiryDateInput || ''} onChange={handleChange} className="text-base h-11"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minPurchaseAmount">Min. Purchase Amount (₹, Optional)</Label>
                <Input id="minPurchaseAmount" name="minPurchaseAmount" type="number" value={formData.minPurchaseAmount || ''} onChange={handleChange} placeholder="e.g., 500" step="0.01" min="0" className="text-base h-11"/>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Switch id="displayOnSite" checked={formData.displayOnSite} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="displayOnSite" className="text-base">Display this coupon on the site (e.g., in a popup or list)</Label>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" className="text-base" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving Coupon...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" /> Save Coupon
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
