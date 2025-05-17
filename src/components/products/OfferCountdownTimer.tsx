
// @/components/products/OfferCountdownTimer.tsx
"use client";

import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, format, isPast, isFuture } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface OfferCountdownTimerProps {
  offerStartDate?: any; // Firestore Timestamp or string
  offerEndDate?: any;   // Firestore Timestamp or string
  className?: string;
}

const convertToDate = (dateInput: any): Date | null => {
  if (!dateInput) return null;
  if (dateInput instanceof Timestamp) return dateInput.toDate();
  if (typeof dateInput === 'string' || typeof dateInput === 'number') {
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};

export function OfferCountdownTimer({ offerStartDate, offerEndDate, className }: OfferCountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [offerStatus, setOfferStatus] = useState<'upcoming' | 'active' | 'expired' | 'invalid'>('invalid');

  const startDate = convertToDate(offerStartDate);
  const endDate = convertToDate(offerEndDate);

  useEffect(() => {
    if (!endDate) {
      setOfferStatus('invalid');
      setTimeLeft('');
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();

      if (startDate && isFuture(startDate)) {
        setOfferStatus('upcoming');
        setTimeLeft(`Starts on ${format(startDate, 'MMM d, yyyy HH:mm')}`);
        return;
      }

      if (isPast(endDate)) {
        setOfferStatus('expired');
        setTimeLeft('Offer has ended');
        return;
      }

      setOfferStatus('active');
      const totalSeconds = differenceInSeconds(endDate, now);
      if (totalSeconds <= 0) {
        setOfferStatus('expired');
        setTimeLeft('Offer has ended');
        return;
      }

      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);

      let timeLeftString = '';
      if (days > 0) timeLeftString += `${days}d `;
      if (hours > 0 || days > 0) timeLeftString += `${hours}h `;
      if (minutes > 0 || hours > 0 || days > 0) timeLeftString += `${minutes}m `;
      timeLeftString += `${seconds}s`;
      
      setTimeLeft(`Ends in: ${timeLeftString.trim()}`);
    };

    calculateTimeLeft(); // Initial calculation
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [offerStartDate, offerEndDate, startDate, endDate]);

  if (offerStatus === 'invalid' || (!startDate && !endDate)) {
    return null; // Don't render anything if dates are invalid or not set
  }

  return (
    <Badge 
        variant={offerStatus === 'expired' ? 'outline' : (offerStatus === 'upcoming' ? 'secondary' : 'default')} 
        className={`text-xs sm:text-sm py-1 px-2.5 ${className} ${offerStatus === 'active' ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
    >
      <Clock className="mr-1.5 h-3.5 w-3.5" />
      {timeLeft}
    </Badge>
  );
}
