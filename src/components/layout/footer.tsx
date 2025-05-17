
// @/components/layout/footer.tsx
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Shirt, Phone, MessageSquare } from 'lucide-react'; // Added Phone and MessageSquare (for WhatsApp)

export function Footer() {
  const whatsappNumber = "919391157177"; // Your WhatsApp number with country code, no '+' or spaces
  const callNumber = "+919391157177";

  return (
    <footer className="bg-muted/50 border-t border-border/40">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Shirt className="h-8 w-8 text-primary" />
              <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                Mens Club
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Keshavapatnam's finest collection for gentlemen.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shipping" className="text-muted-foreground hover:text-primary transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <Link href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={20} /></Link>
              <Link href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={20} /></Link>
              <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors"><Twitter size={20} /></Link>
            </div>
            <ul className="space-y-2 text-sm">
                <li>
                    <a
                        href={`https://wa.me/${whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                    >
                        <MessageSquare size={18} className="mr-2" /> WhatsApp Us
                    </a>
                </li>
                <li>
                    <a
                        href={`tel:${callNumber}`}
                        className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Phone size={18} className="mr-2" /> Call Us: {callNumber}
                    </a>
                </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Mens Club Keshavapatnam. All rights reserved.</p>
          <p className="mt-1">
            Designed with <span className="text-red-500">&hearts;</span> by{' '}
            <a
              href="https://sumanthcsy.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline" 
            >
              Sumanth Csy
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
