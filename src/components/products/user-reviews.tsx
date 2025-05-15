// @/components/products/user-reviews.tsx
import type { Review } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingStars } from '@/components/shared/rating-stars';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageSquarePlus, LogIn } from 'lucide-react';
import Link from 'next/link';

interface UserReviewsProps {
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
}

export function UserReviews({ reviews, averageRating, reviewCount }: UserReviewsProps) {
  const hasReviews = reviews && reviews.length > 0;
  // Simulate a logged-in state. In a real app, this would come from an auth context.
  const isLoggedIn = false; 

  return (
    <Card className="shadow-md border border-border/60">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-semibold">Customer Reviews</CardTitle>
            {averageRating && reviewCount && reviewCount > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <RatingStars rating={averageRating} size={20} />
                <span className="text-muted-foreground text-sm">
                  {averageRating.toFixed(1)} average rating based on {reviewCount} reviews
                </span>
              </div>
            )}
          </div>
          {isLoggedIn ? (
            <Button variant="outline">
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Write a Review
            </Button>
          ) : (
            <div className="text-right">
              <Button variant="outline" disabled>
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Write a Review
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                <Link href="/login" className="text-primary hover:underline">Login</Link> to write a review.
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasReviews ? (
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <div key={review.id}>
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={review.avatarUrl} alt={review.author} data-ai-hint="person avatar"/>
                    <AvatarFallback>{review.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">{review.author}</h4>
                      <time dateTime={review.date} className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString()}
                      </time>
                    </div>
                    <RatingStars rating={review.rating} size={14} className="my-1" />
                    <p className="text-sm text-foreground/90 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
                {index < reviews.length - 1 && <Separator className="my-6" />}
              </div>
            ))}
             {reviews.length > 3 && ( // Example: Show more button if many reviews
              <Button variant="link" className="w-full mt-4">Show all reviews</Button>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No reviews yet for this product. Be the first to write one!</p>
        )}
      </CardContent>
    </Card>
  );
}
