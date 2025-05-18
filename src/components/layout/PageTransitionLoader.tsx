// @/components/layout/PageTransitionLoader.tsx
"use client";

import { useState, useEffect, useRef }
from 'react';
import { usePathname } from 'next/navigation';
import { CustomLoader } from '@/components/layout/CustomLoader'; // Using alias path

export function PageTransitionLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true); // Ref to track initial load

  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false; // Mark initial load as complete
      return; // Don't show loader on the very first page load
    }

    // For subsequent navigations
    setIsLoading(true);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 750); // Duration for the loader to be visible

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname]); // Re-run effect when the pathname changes

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <CustomLoader />
    </div>
  );
}
