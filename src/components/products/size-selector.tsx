
// @/components/products/size-selector.tsx
"use client";

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ProductVariant } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SizeSelectorProps {
  variants: ProductVariant[];
  selectedSize: string;
  onSizeChange: (size: string) => void;
  className?: string;
  displayMode?: 'radio' | 'dropdown'; // New prop
  category?: string; // To help decide displayMode if not explicitly passed
}

export function SizeSelector({
  variants,
  selectedSize,
  onSizeChange,
  className,
  displayMode: explicitDisplayMode,
  category,
}: SizeSelectorProps) {
  if (!variants || variants.length === 0) {
    return <p className="text-sm text-muted-foreground">No sizes available for this product.</p>;
  }

  const availableVariants = variants.filter(v => v.size && v.size.trim() !== '');

  if (availableVariants.length === 0) {
    return <p className="text-sm text-muted-foreground">Sizes not specified for this product.</p>;
  }

  // Determine display mode
  let finalDisplayMode = explicitDisplayMode;
  if (!finalDisplayMode) {
    if ((category?.toLowerCase() === 'jeans' || category?.toLowerCase() === 'trousers') && availableVariants.length > 4) {
      finalDisplayMode = 'dropdown';
    } else if (availableVariants.length > 6) { // General threshold for too many radio buttons
      finalDisplayMode = 'dropdown';
    } else {
      finalDisplayMode = 'radio';
    }
  }


  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-base font-medium text-foreground">Select Size:</Label>
      
      {finalDisplayMode === 'dropdown' ? (
        <Select value={selectedSize} onValueChange={onSizeChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-11 text-base">
            <SelectValue placeholder="Select a size" />
          </SelectTrigger>
          <SelectContent>
            {availableVariants.map((variant) => (
              <SelectItem 
                key={variant.size} 
                value={variant.size}
                disabled={variant.stock <= 0}
              >
                {variant.size} {variant.stock <= 0 ? "(Out of Stock)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <RadioGroup
          value={selectedSize}
          onValueChange={onSizeChange}
          className="flex flex-wrap gap-3"
        >
          {availableVariants.map((variant) => (
            <Label
              key={variant.size}
              htmlFor={`size-${variant.size.replace(/\s+/g, '-')}`} // Ensure ID is valid
              className={cn(
                "cursor-pointer rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium shadow-sm transition-all hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                selectedSize === variant.size ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2" : "text-foreground",
                variant.stock <= 0 ? "opacity-50 cursor-not-allowed line-through" : ""
              )}
            >
              <RadioGroupItem 
                value={variant.size} 
                id={`size-${variant.size.replace(/\s+/g, '-')}`} 
                className="sr-only" 
                disabled={variant.stock <= 0}
              />
              {variant.size}
            </Label>
          ))}
        </RadioGroup>
      )}
    </div>
  );
}
