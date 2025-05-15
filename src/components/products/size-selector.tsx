// @/components/products/size-selector.tsx
"use client";

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSizeChange: (size: string) => void;
  className?: string;
}

export function SizeSelector({ sizes, selectedSize, onSizeChange, className }: SizeSelectorProps) {
  if (!sizes || sizes.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-base font-medium text-foreground">Select Size:</Label>
      <RadioGroup
        value={selectedSize}
        onValueChange={onSizeChange}
        className="flex flex-wrap gap-3"
      >
        {sizes.map((size) => (
          <Label
            key={size}
            htmlFor={`size-${size}`}
            className={cn(
              "cursor-pointer rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium shadow-sm transition-all hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              selectedSize === size ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2" : "text-foreground"
            )}
          >
            <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
            {size}
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
