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
        src="/banner.png" // Updated to use local image from public folder
        alt="Stylish men's fashion collection"
        layout="fill"
        objectFit="cover"
        quality={90}
        priority
        className="brightness-50"
        data-ai-hint="men fashion model" // Retained existing hint
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 max-w-3xl text-white">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-xl">
          Elevate Your Style
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-neutral-200 mb-10 max-w-xl mx-auto drop-shadow-lg">
          Discover premium men's fashion curated for the modern gentleman. Quality, comfort, and sophistication in every piece.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-lg shadow-lg transition-transform hover:scale-105">
            <Link href="/products">
              Shop Collection <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-white border-white/80 hover:bg-white/10 text-lg px-8 py-6 rounded-lg shadow-lg transition-transform hover:scale-105">
            <Link href="/new-arrivals">
              New Arrivals
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
