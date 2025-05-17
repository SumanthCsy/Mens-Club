
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedProducts } from '@/components/home/featured-products';
import { Button } from '@/components/ui/button';
import { ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const categoryLinks = [
  { name: "New Arrivals", href: "/products?category=New%20Arrivals", dataAiHint: "clothing fashion" },
  { name: "Formals & Casuals", href: "/products?category=Formals%20%26%20Casuals", dataAiHint: "formal casual wear" },
  { name: "Trendy", href: "/products?category=Trendy", dataAiHint: "trendy clothes" },
  { name: "Jeans", href: "/products?category=Jeans", dataAiHint: "denim jeans" },
  { name: "T-shirts", href: "/products?category=T-shirts", dataAiHint: "graphic t-shirt" },
  { name: "Limited Offers", href: "/products?category=Limited%20Time%20Offers", dataAiHint: "sale offer" },
];

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Shop by Category Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Shop by Category
            </h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
              Explore our collections tailored to your style.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
            {categoryLinks.map((category) => (
              <Link key={category.name} href={category.href} passHref>
                <Card className="group overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-border/60 hover:border-primary/50 cursor-pointer h-full flex flex-col justify-center items-center text-center p-4 sm:p-6 min-h-[120px] sm:min-h-[150px] bg-card">
                  <CardContent className="p-0">
                    <Tag className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      <FeaturedProducts />
      
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
