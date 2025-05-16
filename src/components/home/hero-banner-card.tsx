// @/components/home/hero-banner-card.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroBannerCardProps {
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  link: string;
}

export function HeroBannerCard({ title, description, imageUrl, imageHint, link }: HeroBannerCardProps) {
  return (
    <Link href={link} className="block group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border/30">
      <div className={cn(
        "aspect-[3/2] sm:aspect-[4/3] md:aspect-[16/9]", // Adjust aspect ratio as needed
        "w-full" 
      )}>
        <Image
          src={imageUrl}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-500 group-hover:scale-105"
          data-ai-hint={imageHint}
          priority={false} // Set to true only for LCP images, likely not all 4 cards
        />
        
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end items-start p-4 xxs:p-5 xs:p-6 text-white w-full">
          <h3 className="text-lg xxs:text-xl xs:text-2xl sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 leading-tight drop-shadow-md group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-xs xxs:text-sm text-neutral-200 mb-2 sm:mb-3 line-clamp-2 drop-shadow-sm">
            {description}
          </p>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs xxs:text-sm py-1.5 px-3 sm:py-2 sm:px-4 group-hover:scale-105 transition-transform shadow-md"
            asChild
          >
            <span className="inline-flex items-center"> {/* Use span for asChild to correctly style */}
              Shop Now <ArrowRight className="ml-1.5 h-3 w-3 sm:h-4 sm:w-4" />
            </span>
          </Button>
        </div>
      </div>
    </Link>
  );
}
