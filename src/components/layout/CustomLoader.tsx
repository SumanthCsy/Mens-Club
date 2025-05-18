// @/components/layout/CustomLoader.tsx
import { Shirt, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CustomLoader() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative h-20 w-20"> {/* Container for icons */}
        {/* Shirt is positioned absolutely, bag is also absolute but lower z-index if needed */}
        <Shirt
          className={cn(
            'absolute top-0 left-1/2 -translate-x-1/2 h-10 w-10 text-primary animate-shirt-drop' 
          )}
        />
        <ShoppingBag
          className={cn(
            'absolute bottom-2 left-1/2 -translate-x-1/2 h-12 w-12 text-primary animate-bag-pulse'
          )}
        />
      </div>
      <p className="text-lg font-medium text-foreground animate-pulse">
        Loading...
      </p>
    </div>
  );
}
