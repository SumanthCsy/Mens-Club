// @/components/products/user-reviews.tsx
"use client";

import type { Review, UserData } from '@/types'; // UserData might not be directly needed, but currentUser is
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingStars } from '@/components/shared/rating-stars';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageSquarePlus, LogIn, Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AddReviewModal } from './AddReviewModal';
import { EditReviewModal } from './EditReviewModal'; // New Import
import { useToast } from '@/hooks/use-toast';
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
import type { User as FirebaseUser } from 'firebase/auth';

interface UserReviewsProps {
  productId: string;
  reviews?: Review[];
  averageRatingProp?: number;
  reviewCountProp?: number;
  isAuthenticated: boolean;
  currentUser: FirebaseUser | null; // Added currentUser prop
  onReviewSubmit: (productId: string, rating: number, comment: string) => Promise<void>;
  onDeleteReview: (productId: string, reviewId: string, reviewObject: Review) => Promise<void>; // Modified to pass full review object
  onUpdateReview: (productId: string, reviewId: string, newRating: number, newComment: string) => Promise<void>;
}

export function UserReviews({
  productId,
  reviews,
  averageRatingProp,
  reviewCountProp,
  isAuthenticated,
  currentUser,
  onReviewSubmit,
  onDeleteReview,
  onUpdateReview,
}: UserReviewsProps) {
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const { toast } = useToast();

  const hasReviews = reviews && reviews.length > 0;

  const effectiveReviewCount = reviewCountProp !== undefined ? reviewCountProp : (reviews?.length || 0);
  const effectiveAverageRating =
    averageRatingProp !== undefined
      ? averageRatingProp
      : (hasReviews && reviews && effectiveReviewCount > 0
          ? reviews.reduce((acc, review) => acc + review.rating, 0) / effectiveReviewCount
          : 0);

  const handleEditClick = (review: Review) => {
    setReviewToEdit(review);
    setIsEditReviewModalOpen(true);
  };

  const handleDeleteClick = (review: Review) => {
    setReviewToDelete(review);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete || !reviewToDelete.id) return;
    setIsDeletingReview(true);
    try {
      await onDeleteReview(productId, reviewToDelete.id, reviewToDelete); // Pass full review object
      // Toast handled by parent
      setReviewToDelete(null);
    } catch (error) {
      toast({ title: "Error", description: "Could not delete review.", variant: "destructive" });
    } finally {
      setIsDeletingReview(false);
    }
  };

  return (
    <>
      <Card className="shadow-md border border-border/60">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-semibold">Customer Reviews</CardTitle>
              {effectiveReviewCount > 0 ? (
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars rating={effectiveAverageRating} size={20} />
                  <span className="text-muted-foreground text-sm">
                    {effectiveAverageRating.toFixed(1)} average rating based on {effectiveReviewCount} {effectiveReviewCount === 1 ? "review" : "reviews"}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground mt-1">No reviews yet</span>
              )}
            </div>
            {isAuthenticated ? (
              <Button variant="outline" onClick={() => setIsAddReviewModalOpen(true)}>
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Write a Review
              </Button>
            ) : (
              <div className="text-right">
                <Button variant="outline" asChild>
                  <Link href="/login?redirect=/products/${productId}">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login to Write Review
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasReviews && reviews ? (
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div key={review.id || `review-${index}`}>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={review.avatarUrl || undefined} alt={review.author} data-ai-hint="person avatar"/>
                      <AvatarFallback>{review.author?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">{review.author}</h4>
                        <time dateTime={review.date} className="text-xs text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
                        </time>
                      </div>
                      <RatingStars rating={review.rating} size={14} className="my-1" />
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{review.comment}</p>
                       {isAuthenticated && currentUser && review.userId === currentUser.uid && (
                        <div className="mt-2 flex gap-2">
                          <Button variant="outline" size="sm" className="h-7 px-2 py-1 text-xs" onClick={() => handleEditClick(review)}>
                            <Edit className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteClick(review)}>
                            <Trash2 className="mr-1 h-3 w-3" /> Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < reviews.length - 1 && <Separator className="my-6" />}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No reviews yet for this product. Be the first to write one!</p>
          )}
        </CardContent>
      </Card>

      {productId && (
        <AddReviewModal
          productId={productId}
          isOpen={isAddReviewModalOpen}
          onClose={() => setIsAddReviewModalOpen(false)}
          onReviewSubmit={onReviewSubmit}
        />
      )}

      {reviewToEdit && productId && (
        <EditReviewModal
          productId={productId}
          reviewToEdit={reviewToEdit}
          isOpen={isEditReviewModalOpen}
          onClose={() => {
            setIsEditReviewModalOpen(false);
            setReviewToEdit(null);
          }}
          onReviewUpdate={onUpdateReview}
        />
      )}
      
      {reviewToDelete && (
        <AlertDialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your review.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setReviewToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteReview} className="bg-destructive hover:bg-destructive/90" disabled={isDeletingReview}>
                {isDeletingReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
