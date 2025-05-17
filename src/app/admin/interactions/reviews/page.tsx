
// @/app/admin/interactions/reviews/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Star, Trash2, Loader2, AlertTriangle, PackageSearch, Eye } from 'lucide-react';
import type { Product, Review } from '@/types';
import { collection, getDocs, doc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { RatingStars } from '@/components/shared/rating-stars';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReviewWithProductInfo extends Review {
  productId: string;
  productName: string;
}

export default function AdminManageReviewsPage() {
  const [allReviews, setAllReviews] = useState<ReviewWithProductInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewWithProductInfo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const reviewsList: ReviewWithProductInfo[] = [];
        productsSnapshot.forEach(productDoc => {
          const product = productDoc.data() as Product;
          if (product.reviews && product.reviews.length > 0) {
            product.reviews.forEach(review => {
              reviewsList.push({
                ...review,
                productId: productDoc.id,
                productName: product.name,
              });
            });
          }
        });
        // Sort reviews by date, newest first for example
        reviewsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAllReviews(reviewsList);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews.");
        toast({ title: "Error", description: "Could not load reviews.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [toast]);

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    try {
      const productRef = doc(db, "products", reviewToDelete.productId);
      // Find the full review object to remove, as arrayRemove needs the exact object match
      const productSnapshot = await getDoc(productRef);
      if (productSnapshot.exists()) {
        const productData = productSnapshot.data() as Product;
        const reviewObjectInFirestore = productData.reviews?.find(r => r.id === reviewToDelete.id);

        if (reviewObjectInFirestore) {
            await updateDoc(productRef, {
                reviews: arrayRemove(reviewObjectInFirestore)
            });

            setAllReviews(prev => prev.filter(r => r.id !== reviewToDelete.id));
            toast({ title: "Review Deleted", description: "The review has been successfully deleted." });
        } else {
            throw new Error("Review object not found in product's review array for precise deletion.");
        }
      } else {
        throw new Error("Product not found for review deletion.");
      }
      setReviewToDelete(null);
    } catch (err: any) {
      console.error("Error deleting review:", err);
      toast({ title: "Deletion Failed", description: err.message || "Could not delete the review.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Star className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Manage Reviews</h1>
            <p className="mt-1 text-md text-muted-foreground">Moderate and respond to customer product reviews.</p>
          </div>
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <CardHeader>
          <CardTitle>All Product Reviews ({allReviews.length})</CardTitle>
          <CardDescription>Approve, delete, or reply to reviews submitted by customers. Reviews are sorted by date (newest first).</CardDescription>
        </CardHeader>
        <CardContent>
          {allReviews.length === 0 ? (
            <div className="text-center py-10">
              <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No reviews found for any product.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Product</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="min-w-[250px]">Comment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">
                        <Link href={`/products/${review.productId}`} target="_blank" className="hover:underline text-primary flex items-center gap-1.5">
                           {review.productName} <Eye className="h-3.5 w-3.5"/>
                        </Link>
                      </TableCell>
                      <TableCell>{review.author}</TableCell>
                      <TableCell><RatingStars rating={review.rating} size={16} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-pre-line break-words max-w-xs">{review.comment}</TableCell>
                      <TableCell>{format(new Date(review.date), 'PP')}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setReviewToDelete(review)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {allReviews.length > 10 && (
             <CardFooter className="justify-end">
                <p className="text-sm text-muted-foreground">Displaying latest {allReviews.length} reviews.</p>
            </CardFooter>
        )}
      </Card>

      {reviewToDelete && (
        <AlertDialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Review?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this review by {reviewToDelete.author} for "{reviewToDelete.productName}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteReview}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, Delete Review
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
