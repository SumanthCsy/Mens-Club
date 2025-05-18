// @/components/layout/CustomLoader.tsx
import { Shirt, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CustomLoader() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative h-16 w-32 overflow-hidden"> {/* Container for icons */}
        <Shirt
          className={cn(
            'absolute left-0 top-0 h-12 w-12 text-primary animate-slide-icons',
          )}
          style={{ animationDelay: '0s' }} // Shirt starts immediately
        />
        <ShoppingBag
          className={cn(
            'absolute left-0 top-0 h-12 w-12 text-primary animate-slide-icons', // Using primary color for better visibility
          )}
          style={{ animationDelay: '0.3s' }} // ShoppingBag starts slightly later for a chase effect
        />
      </div>
      <p className="text-lg font-medium text-foreground animate-pulse">
        Loading...
      </p>
    </div>
  );
}
