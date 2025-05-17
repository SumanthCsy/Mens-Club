// @/components/products/EditReviewModal.tsx
"use client";

import { useState, useEffect } from 'react';
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
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Review } from '@/types';

interface EditReviewModalProps {
  productId: string; // Though not directly used by this modal, might be useful for context or future
  reviewToEdit: Review;
  isOpen: boolean;
  onClose: () => void;
  onReviewUpdate: (productId: string, reviewId: string, newRating: number, newComment: string) => Promise<void>;
}

export function EditReviewModal({ productId, reviewToEdit, isOpen, onClose, onReviewUpdate }: EditReviewModalProps) {
  const [rating, setRating] = useState(reviewToEdit.rating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(reviewToEdit.comment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setRating(reviewToEdit.rating);
      setComment(reviewToEdit.comment);
    }
  }, [isOpen, reviewToEdit]);

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
      await onReviewUpdate(productId, reviewToEdit.id, rating, comment);
      // Success toast handled by parent
      onClose();
    } catch (error) {
      console.error("Error updating review:", error);
      toast({ title: "Update Failed", description: "Could not update your review. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Your Review</DialogTitle>
          <DialogDescription>Update your rating and comment for this product.</DialogDescription>
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
            <Label htmlFor="edit-review-comment" className="text-sm font-medium mb-2 block">Your Comment:</Label>
            <Textarea
              id="edit-review-comment"
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
            <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
