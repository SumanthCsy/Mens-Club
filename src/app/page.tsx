import { HeroSection } from '@/components/home/hero-section';
import { FeaturedProducts } from '@/components/home/featured-products';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      
      {/* Additional Call to Action Section (Optional) */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
            Explore the Full Range
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            From timeless classics to modern essentials, find everything you need to complete your wardrobe.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-lg shadow-lg transition-transform hover:scale-105">
            <Link href="/products">
              Discover All Products <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
