
// @/components/layout/FloatingContactButtons.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircleMore, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// WhatsApp SVG Icon
const WhatsAppIcon = () => (
  <svg
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="h-7 w-7"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.31 20.52C8.75 21.33 10.36 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2ZM16.56 15.29C16.41 15.56 15.31 16.11 14.91 16.25C14.51 16.39 13.81 16.46 13.27 16.25C12.73 16.04 11.94 15.68 11.03 14.82C9.91 13.74 9.23 12.53 9.06 12.26C8.89 11.99 8.72 11.72 8.72 11.41C8.72 11.1 8.89 10.83 9.06 10.66C9.23 10.49 9.43 10.39 9.61 10.39C9.78 10.39 9.92 10.39 10.06 10.41C10.21 10.42 10.33 10.43 10.47 10.74C10.62 11.06 11.01 12.01 11.08 12.11C11.16 12.22 11.21 12.33 11.13 12.44C11.04 12.56 10.99 12.63 10.85 12.78C10.71 12.94 10.56 13.08 10.44 13.17C10.33 13.27 10.21 13.36 10.33 13.51C10.44 13.65 10.81 14.11 11.23 14.51C11.79 15.04 12.23 15.34 12.47 15.51C12.71 15.68 12.91 15.65 13.05 15.51C13.19 15.37 13.65 14.88 13.82 14.64C13.99 14.41 14.23 14.38 14.47 14.38C14.71 14.38 15.63 14.88 15.84 14.98C16.05 15.08 16.22 15.11 16.29 15.22C16.37 15.32 16.37 15.84 16.19 16.18C16.02 16.51 15.31 17 14.98 17.14C14.64 17.28 13.97 17.35 13.43 17.14C12.89 16.93 11.97 16.54 10.96 15.58C9.73 14.41 9 13.03 9 11.41C9 11.13 9.09 10.88 9.23 10.68C9.38 10.48 9.6 10.27 9.91 10.16C10.22 10.06 10.47 10 10.82 10C11.18 10 11.46 10.04 11.71 10.09C11.96 10.14 12.13 10.27 12.27 10.44C12.41 10.61 12.49 10.85 12.52 11.12C12.54 11.39 12.44 11.68 12.38 11.83L11.93 13.08C11.84 13.32 11.96 13.56 12.19 13.73C12.43 13.91 12.85 14.21 13.39 14.48C13.93 14.76 14.33 14.85 14.58 14.85C14.84 14.85 15.34 14.68 15.59 14.31C15.84 13.94 15.92 13.38 15.87 13.11C15.81 12.84 15.49 11.93 15.31 11.66C15.13 11.39 14.86 11.21 14.53 11.21C14.21 11.21 13.94 11.29 13.71 11.39C13.49 11.49 13.16 11.66 13.02 11.83C12.89 11.99 12.71 12.23 12.71 12.44C12.71 12.65 12.82 12.85 12.94 12.97L16.56 15.29Z"></path>
  </svg>
);

export function FloatingContactButtons() {
  const [isExpanded, setIsExpanded] = useState(false);
  const whatsappNumber = "919391157177"; // WhatsApp number with country code
  const callNumber = "+919391157177"; // Full number for tel link

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Conditionally rendered action buttons */}
      <div
        className={cn(
          "flex flex-col items-end gap-3 transition-all duration-300 ease-in-out",
          isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <Button
          asChild
          size="icon"
          className="rounded-full h-12 w-12 bg-green-500 hover:bg-green-600 text-white shadow-lg transition-transform hover:scale-110"
          aria-label="Chat on WhatsApp"
        >
          <Link href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
          </Link>
        </Button>
        <Button
          asChild
          size="icon"
          className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform hover:scale-110"
          aria-label="Call us"
        >
          <Link href={`tel:${callNumber}`}>
            <Phone className="h-6 w-6" />
          </Link>
        </Button>
      </div>

      {/* Main Toggle Button */}
      <Button
        size="icon"
        className="rounded-full h-14 w-14 bg-primary hover:bg-primary/80 text-primary-foreground shadow-xl transition-all duration-300 ease-in-out hover:scale-110 focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Close contact options" : "Open contact options"}
      >
        {isExpanded ? <X className="h-7 w-7" /> : <MessageCircleMore className="h-7 w-7" />}
      </Button>
    </div>
  );
}
