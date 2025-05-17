
// @/app/admin/coupons/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, PlusCircle, Ticket, Loader2, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import type { Coupon } from '@/types';
import { collection, query, orderBy as firestoreOrderBy, onSnapshot, Unsubscribe, Timestamp } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function ViewCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const couponsCol = collection(db, "coupons");
    const q = query(couponsCol, firestoreOrderBy("createdAt", "desc"));

    const unsubscribe: Unsubscribe = onSnapshot(q, (querySnapshot) => {
      const couponList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          expiryDate: data.expiryDate instanceof Timestamp ? data.expiryDate.toDate() : data.expiryDate,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
        } as Coupon;
      });
      setCoupons(couponList);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching coupons:", err);
      setError("Failed to load coupons. Please try again.");
      toast({ title: "Error", description: "Could not load coupons.", variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    }
    return `₹${coupon.discountValue.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading coupons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Ticket className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Manage Coupons</h1>
              <p className="mt-1 text-md text-muted-foreground">View, create, and manage discount coupons.</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/admin/coupons/add">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Coupon
            </Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <CardHeader>
          <CardTitle>All Coupons ({coupons.length})</CardTitle>
          <CardDescription>A list of all available discount coupons. Updates in real-time.</CardDescription>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="text-center py-10">
              <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No coupons found. Add new coupons to see them here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Min. Purchase</TableHead>
                    <TableHead>Display on Site</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-center w-[130px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-medium">{coupon.code}</TableCell>
                      <TableCell>{formatDiscount(coupon)}</TableCell>
                      <TableCell>
                        {coupon.expiryDate ? format(new Date(coupon.expiryDate), 'PP') : 'No Expiry'}
                      </TableCell>
                      <TableCell>
                        {coupon.minPurchaseAmount ? `₹${coupon.minPurchaseAmount.toFixed(2)}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={coupon.displayOnSite ? 'default' : 'outline'}>
                          {coupon.displayOnSite ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={coupon.isActive ? 'default' : 'destructive'}>
                           {coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="icon" asChild className="h-8 w-8" disabled>
                            <Link href={`/admin/coupons/edit/${coupon.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="destructive" size="icon" className="h-8 w-8" disabled>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
