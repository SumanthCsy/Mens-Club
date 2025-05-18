// @/components/layout/CustomLoader.tsx
import { Shirt, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CustomLoader() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative h-16 w-32 overflow-hidden">
        {/* Note: The animation for multiple icons sliding in a "chase" effect with different delays
            can be complex with just Tailwind utility classes if they need to loop and reset independently
            while staying within the same container.
            A simpler approach for a shared animation name 'animate-slide-icons' is one icon leading another.
            The keyframes in globals.css and tailwind.config.ts define 'slide-icons'.
            We apply it with different delays.
        */}
        <Shirt
          className={cn(
            'absolute left-0 top-0 h-12 w-12 text-primary animate-slide-icons',
            // Tailwind doesn't have direct animation-delay utilities out of the box for arbitrary values.
            // You would typically define these in your globals.css if needed, e.g., .animation-delay-0, .animation-delay-200ms
            // For simplicity here, we use inline styles for animationDelay.
          )}
          style={{ animationDelay: '0s' }}
        />
        <ShoppingBag
          className={cn(
            'absolute left-0 top-0 h-12 w-12 text-secondary animate-slide-icons',
          )}
          style={{ animationDelay: '0.2s' }} // Second icon starts slightly later
        />
      </div>
      <p className="text-lg font-medium text-foreground animate-pulse">
        Loading...
      </p>
    </div>
  );
}
