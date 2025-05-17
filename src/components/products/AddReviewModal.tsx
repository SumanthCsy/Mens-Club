
// @/components/products/AddReviewModal.tsx
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AddReviewModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmit: (productId: string, rating: number, comment: string) => Promise<void>;
}

export function AddReviewModal({ productId, isOpen, onClose, onReviewSubmit }: AddReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Rating Required", description: "Please select a star rating.", variant: "destructive" });
      return;
    }
    if (!comment.trim()) {
      toast({ title: "Comment Required", description: "Please write a comment for your review.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await onReviewSubmit(productId, rating, comment);
      // Success toast should be handled by the parent component after successful Firestore write
      onClose(); // Close modal on successful submission
      setRating(0); // Reset form
      setComment('');
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({ title: "Submission Failed", description: "Could not submit your review. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Write a Review</DialogTitle>
          <DialogDescription>Share your thoughts about this product.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <Label className="text-sm font-medium mb-2 block">Your Rating:</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-7 w-7 cursor-pointer transition-colors",
                    (hoverRating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50"
                  )}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="review-comment" className="text-sm font-medium mb-2 block">Your Comment:</Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you think..."
              rows={5}
              className="text-base"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
