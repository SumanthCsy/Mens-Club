
// @/components/layout/FloatingContactButtons.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare } from 'lucide-react'; // MessageSquare is often used for chat/WhatsApp

export function FloatingContactButtons() {
  const whatsappNumber = "919391157177"; // WhatsApp number with country code
  const callNumber = "+919391157177"; // Full number for tel link

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <Button
        asChild
        size="icon"
        className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600 text-white shadow-lg transition-transform hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <Link href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
          <MessageSquare className="h-7 w-7" />
        </Link>
      </Button>
      <Button
        asChild
        size="icon"
        className="rounded-full h-14 w-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform hover:scale-110"
        aria-label="Call us"
      >
        <Link href={`tel:${callNumber}`}>
          <Phone className="h-7 w-7" />
        </Link>
      </Button>
    </div>
  );
}
