// @/components/home/hero-section.tsx
import { HeroBannerCard } from './hero-banner-card'; // New component

const heroCardData = [
  {
    id: '1',
    title: 'New Arrivals',
    description: 'Fresh styles just landed. Explore the latest trends.',
    imageUrl: '/bng1.jpg', // Placeholder, user will update
    imageHint: 'fashion new arrivals',
    link: '/products?category=new-arrivals', // Example link
  },
  {
    id: '2',
    title: 'Seasonal Collection',
    description: 'Curated outfits for the current season.',
    imageUrl: '/bng2.jpg', // Placeholder
    imageHint: 'seasonal fashion',
    link: '/products?category=seasonal', // Example link
  },
  {
    id: '3',
    title: 'Limited Time Offers',
    description: 'Grab these deals before they are gone!',
    imageUrl: '/bng3.jpg', // Placeholder
    imageHint: 'fashion sale',
    link: '/sale', // Example link
  },
  {
    id: '4',
    title: 'Wardrobe Essentials',
    description: 'Timeless pieces for every gentleman.',
    imageUrl: '/bng4.jpg', // Placeholder
    imageHint: 'classic men clothing',
    link: '/products?category=essentials', // Example link
  },
];

export function HeroSection() {
  return (
    <section className="py-8 md:py-12 bg-muted/20">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {heroCardData.map((card) => (
            <HeroBannerCard
              key={card.id}
              title={card.title}
              description={card.description}
              imageUrl={card.imageUrl}
              imageHint={card.imageHint}
              link={card.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
