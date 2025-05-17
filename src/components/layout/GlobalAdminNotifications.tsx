// @/components/layout/GlobalAdminNotifications.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { BellRing, AlertTriangle } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Unsubscribe, doc, getDoc } from "firebase/firestore";
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function GlobalAdminNotifications() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [alertModalType, setAlertModalType] = useState<'initial' | 'newOrder' | null>(null);
  const [hasShownInitialNotificationThisSession, setHasShownInitialNotificationThisSession] = useState(false);
  const previousPendingOrdersCountRef = useRef<number | null>(null);

  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Preload audio
    if (typeof window !== 'undefined') {
      const audio = new Audio('/success.mp3'); // Ensure success.mp3 is in your /public directory
      audio.load();
      audioRef.current = audio;
      console.log('Audio element initialized for admin notifications:', audioRef.current);
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      setIsLoadingAuth(true);
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserData;
            setIsAdmin(userData.role === 'admin');
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user role for global notifications:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
        setHasShownInitialNotificationThisSession(false);
        previousPendingOrdersCountRef.current = null;
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribeAuth();
  }, []);

  const playSuccessSound = () => {
    console.log('Attempting to play new order sound. audioRef.current:', audioRef.current);
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Rewind to start
      audioRef.current.play().then(() => {
        console.log('New order sound played successfully.');
      }).catch(error => {
        console.error("Error playing new order sound:", error, `Error Name: ${error.name}, Error Message: ${error.message}`);
        toast({
          title: "New Order Sound Issue",
          description: `The new order sound was blocked or failed. Browsers often block audio without direct user interaction. Error: ${error.message}`,
          variant: "default",
          duration: 10000
        });
      });
    } else {
      console.warn("Audio element not ready for new order sound or success.mp3 not found in /public folder.");
       toast({
        title: "Audio System Issue",
        description: "Could not play new order sound: Audio element not ready. Ensure success.mp3 is in /public.",
        variant: "destructive",
        duration: 8000
      });
    }
  };

  useEffect(() => {
    let unsubscribeOrders: Unsubscribe | undefined;

    if (isAdmin && currentUser && !isLoadingAuth) {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("status", "==", "Pending"));

      unsubscribeOrders = onSnapshot(q, (querySnapshot) => {
        const currentCount = querySnapshot.size;
        setPendingOrdersCount(currentCount);
        
        console.log(`[GlobalAdminNotifications] Pending orders snapshot: currentCount=${currentCount}, previousCount=${previousPendingOrdersCountRef.current}, initialNotifShown=${hasShownInitialNotificationThisSession}`);

        if (previousPendingOrdersCountRef.current === null) { // First time loading for this admin session
          if (currentCount > 0 && !hasShownInitialNotificationThisSession) {
            setAlertModalType('initial');
            setShowNotificationModal(true);
          }
        } else if (currentCount > previousPendingOrdersCountRef.current) { // New order(s) arrived
          console.log(`[GlobalAdminNotifications] New order detected.`);
          setAlertModalType('newOrder');
          setShowNotificationModal(true);
          playSuccessSound();
        }
        previousPendingOrdersCountRef.current = currentCount;
      }, (error) => {
        console.error("[GlobalAdminNotifications] Error fetching pending orders:", error);
         toast({
          title: "Error Loading Pending Orders",
          description: "Could not update pending order count for admin notifications.",
          variant: "destructive"
        });
      });
    } else {
      setPendingOrdersCount(0);
      setShowNotificationModal(false);
      setAlertModalType(null);
      if (!isAdmin && !currentUser) { // Reset only if truly logged out or not an admin
        previousPendingOrdersCountRef.current = null; 
      }
    }

    return () => {
      if (unsubscribeOrders) {
        unsubscribeOrders();
      }
    };
  }, [isAdmin, currentUser, isLoadingAuth, hasShownInitialNotificationThisSession, toast]);
  
  const handleModalClose = () => {
    if (alertModalType === 'initial') {
      setHasShownInitialNotificationThisSession(true);
    }
    setShowNotificationModal(false);
    setAlertModalType(null);
  };

  if (isLoadingAuth) return null; 

  return (
    <>
      {(showNotificationModal && alertModalType && isAdmin) && (
        <AlertDialog open={showNotificationModal} onOpenChange={(open) => !open && handleModalClose()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <BellRing className={cn("h-6 w-6 mr-2 text-primary", alertModalType === 'newOrder' && "animate-pulse")} />
                {alertModalType === 'newOrder' ? "New Order Received!" : "Pending Orders Alert"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {alertModalType === 'newOrder' 
                  ? `A new order has been placed. You now have ${pendingOrdersCount} total pending order(s).`
                  : `You have ${pendingOrdersCount} order(s) with "Pending" status that require your attention.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleModalClose}>Dismiss</AlertDialogCancel>
              <AlertDialogAction asChild onClick={handleModalClose}>
                <Link href="/admin/orders">View Orders</Link>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
