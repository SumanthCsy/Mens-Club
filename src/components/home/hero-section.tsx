// @/components/home/hero-section.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative w-full h-[calc(100vh-4rem)] min-h-[500px] md:min-h-[600px] lg:min-h-[700px] flex items-center justify-center text-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/banner.png" // This line assumes banner.png is in the public folder
        alt="Stylish men's fashion collection"
        layout="fill"
        objectFit="cover"
        quality={90}
        priority
        // Removed className="brightness-50" to make the image brighter
        data-ai-hint="men fashion model"
      />
      
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 p-4 xxs:p-5 xs:p-6 text-white w-full max-w-3xl mx-auto">
        <h1 className="text-4xl xxs:text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 drop-shadow-xl">
          Elevate Your Style
        </h1>
        <p className="text-md xxs:text-md xs:text-lg sm:text-lg md:text-xl text-neutral-200 mb-8 sm:mb-10 max-w-xl mx-auto drop-shadow-lg">
          Discover premium men's fashion curated for the modern gentleman. Quality, comfort, and sophistication in every piece.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-6 rounded-lg shadow-lg transition-transform hover:scale-105 w-full sm:w-auto">
            <Link href="/products">
              Shop Collection <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-white border-white/80 hover:bg-white/10 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-6 rounded-lg shadow-lg transition-transform hover:scale-105 w-full sm:w-auto">
            <Link href="/new-arrivals"> {/* This route might not exist yet, but link is for UI */}
              New Arrivals
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
