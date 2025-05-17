
// @/components/products/user-reviews.tsx
import type { Review } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingStars } from '@/components/shared/rating-stars';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageSquarePlus, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react'; // Added for modal state
import { AddReviewModal } from './AddReviewModal'; // Import the new modal

interface UserReviewsProps {
  productId: string; // Added productId
  reviews?: Review[];
  // averageRating and reviewCount can be derived from reviews array or passed if pre-calculated
  // For simplicity, we'll derive it here if not provided, or use passed values.
  averageRatingProp?: number;
  reviewCountProp?: number;
  isAuthenticated: boolean;
  onReviewSubmit: (productId: string, rating: number, comment: string) => Promise<void>; // Added for callback
}

export function UserReviews({ 
  productId, 
  reviews, 
  averageRatingProp, 
  reviewCountProp, 
  isAuthenticated,
  onReviewSubmit 
}: UserReviewsProps) {
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const hasReviews = reviews && reviews.length > 0;

  // Calculate averageRating and reviewCount from the reviews array if not provided
  const effectiveReviewCount = reviewCountProp !== undefined ? reviewCountProp : (reviews?.length || 0);
  const effectiveAverageRating = averageRatingProp !== undefined 
    ? averageRatingProp 
    : (hasReviews && reviews && effectiveReviewCount > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / effectiveReviewCount
        : 0);

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
                  <Link href="/login">
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
                <div key={review.id || index}>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={review.avatarUrl} alt={review.author} data-ai-hint="person avatar"/>
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
                    </div>
                  </div>
                  {index < reviews.length - 1 && <Separator className="my-6" />}
                </div>
              ))}
              {reviews.length > 3 && ( // Example: Show more button if many reviews
                <Button variant="link" className="w-full mt-4" disabled> 
                  Show all reviews (Soon)
                </Button>
              )}
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
    </>
  );
}
