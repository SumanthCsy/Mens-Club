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
        className="brightness-50"
        data-ai-hint="men fashion model"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 p-4 sm:p-6 md:p-8 max-w-3xl text-white">
        <h1 className="text-4xl xxs:text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 drop-shadow-xl">
          Elevate Your Style
        </h1>
        <p className="text-md sm:text-lg md:text-xl text-neutral-200 mb-8 sm:mb-10 max-w-xl mx-auto drop-shadow-lg">
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

// Added custom breakpoints in tailwind.config.ts for xxs and xs if needed for finer control, e.g.:
// theme: {
//   extend: {
//     screens: {
//       'xxs': '360px',
//       'xs': '480px',
//     }
//   }
// }
// However, for this change, using existing sm, md, lg breakpoints should suffice for better scaling.
// The text-4xl will be the base, scaling up.
// Padding and button sizes also adjusted for mobile.
