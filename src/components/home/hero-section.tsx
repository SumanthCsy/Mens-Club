// @/components/home/hero-section.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative w-full h-[calc(100vh-4rem)] min-h-[500px] md:min-h-[600px] lg:min-h-[700px] flex items-center justify-start text-left overflow-hidden">
      {/* Background Image */}
      <Image
        src="/banner.png" // This line assumes banner.png is in the public folder
        alt="Stylish men's fashion collection"
        layout="fill"
        objectFit="cover"
        quality={90}
        priority
        data-ai-hint="men fashion model"
      />
      
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/50 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 p-4 xxs:p-5 xs:p-6 sm:p-8 md:p-12 lg:p-16 text-white w-full max-w-xs xxs:max-w-sm xs:max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <h1 className="text-3xl xxs:text-4xl xs:text-5xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6 drop-shadow-xl">
          Elevate Your Style
        </h1>
        <p className="text-base xxs:text-md xs:text-lg sm:text-lg md:text-xl text-neutral-200 mb-6 sm:mb-8 drop-shadow-lg">
          Discover premium men's fashion curated for the modern gentleman. Quality, comfort, and sophistication in every piece.
        </p>
        <div className="flex flex-col xxs:flex-row sm:flex-row items-start xxs:items-center gap-3 sm:gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm xxs:text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-6 rounded-lg shadow-lg transition-transform hover:scale-105 w-full xxs:w-auto">
            <Link href="/products">
              Shop Collection <ArrowRight className="ml-1.5 xxs:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-white border-white/80 hover:bg-white/10 text-sm xxs:text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-6 rounded-lg shadow-lg transition-transform hover:scale-105 w-full xxs:w-auto">
            <Link href="/new-arrivals"> {/* This route might not exist yet, but link is for UI */}
              New Arrivals
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
