// @/components/cart/cart-item-card.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { CartItemData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface CartItemCardProps {
  item: CartItemData;
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
}

export function CartItemCard({ item, onRemoveItem, onUpdateQuantity }: CartItemCardProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) newQuantity = 1;
    if (item.stock && newQuantity > item.stock) newQuantity = item.stock;
    setQuantity(newQuantity);
    onUpdateQuantity(item.id, newQuantity);
  };

  const handleRemove = () => {
    onRemoveItem(item.id);
    toast({
      title: "Item Removed",
      description: `${item.name} has been removed from your cart.`,
    });
  };

  return (
    <div className="flex items-start sm:items-center gap-4 sm:gap-6 p-4 border border-border/60 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
      <Link href={`/products/${item.id}`} className="shrink-0">
        <div className="w-20 h-28 sm:w-24 sm:h-32 overflow-hidden rounded-md bg-muted">
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={100}
            height={133}
            className="object-cover w-full h-full"
            data-ai-hint={item.dataAiHint || "fashion clothing"}
          />
        </div>
      </Link>

      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <Link href={`/products/${item.id}`} className="hover:text-primary transition-colors">
              <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight">{item.name}</h3>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Size: {item.selectedSize} {item.selectedColor && `| Color: ${item.selectedColor}`}
            </p>
            {item.stock && item.stock < 10 && (
              <p className="text-xs text-destructive mt-0.5">Only {item.stock} left in stock!</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={handleRemove} className="text-muted-foreground hover:text-destructive -mr-2 -mt-1 sm:mt-0">
            <X className="h-5 w-5" />
            <span className="sr-only">Remove item</span>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-2 sm:mt-3">
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}>
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
              min="1"
              max={item.stock || 99}
              className="h-8 w-14 text-center px-1"
              aria-label="Quantity"
            />
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(quantity + 1)} disabled={item.stock ? quantity >= item.stock : false}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-base sm:text-lg font-semibold text-primary mt-2 sm:mt-0">
            ${(item.price * quantity).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
