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
import { BellRing, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Unsubscribe, doc, getDoc } from "firebase/firestore";
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserData } from '@/types';

export function GlobalAdminNotifications() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationType, setNotificationType] = useState<'initial' | 'newOrder' | null>(null);
  const [hasShownInitialNotificationThisSession, setHasShownInitialNotificationThisSession] = useState(false);
  const previousPendingOrdersCountRef = useRef<number | null>(null); // Using ref to avoid re-triggering effect unnecessarily

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
        setHasShownInitialNotificationThisSession(false); // Reset flag on logout
        previousPendingOrdersCountRef.current = null; // Reset previous count on logout
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeOrders: Unsubscribe | undefined;

    if (isAdmin && currentUser && !isLoadingAuth) {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("status", "==", "Pending"));

      unsubscribeOrders = onSnapshot(q, (querySnapshot) => {
        const currentCount = querySnapshot.size;
        setPendingOrdersCount(currentCount);

        if (previousPendingOrdersCountRef.current === null) { // First time loading for this session/admin
          previousPendingOrdersCountRef.current = currentCount;
          if (currentCount > 0 && !hasShownInitialNotificationThisSession) {
            setNotificationType('initial');
            setShowNotificationModal(true);
          }
        } else if (currentCount > (previousPendingOrdersCountRef.current ?? 0) ) { // New order(s) arrived
          setNotificationType('newOrder');
          setShowNotificationModal(true);
          const audio = new Audio('/success.mp3');
          audio.play().catch(error => {
            console.warn("Audio autoplay prevented for new order notification:", error);
          });
        } else if (currentCount === 0) { // No pending orders, ensure modal is closed
            setShowNotificationModal(false);
        }
        // Always update the ref to the latest count for the next comparison
        previousPendingOrdersCountRef.current = currentCount;

      }, (error) => {
        console.error("Error fetching pending orders for global notification:", error);
      });
    } else {
      setPendingOrdersCount(0);
      setShowNotificationModal(false);
      previousPendingOrdersCountRef.current = null; // Ensure reset if not admin
    }

    return () => {
      if (unsubscribeOrders) {
        unsubscribeOrders();
      }
    };
  }, [isAdmin, currentUser, isLoadingAuth, hasShownInitialNotificationThisSession]);

  const handleDismissModal = () => {
    if (notificationType === 'initial') {
      setHasShownInitialNotificationThisSession(true);
    }
    setShowNotificationModal(false);
    setNotificationType(null); // Reset notification type
  };
  
  const handleViewOrders = () => {
    if (notificationType === 'initial') {
      setHasShownInitialNotificationThisSession(true);
    }
    setShowNotificationModal(false);
    setNotificationType(null);
    // Navigation will be handled by the Link component
  };

  if (isLoadingAuth || !isAdmin || !showNotificationModal) {
    return null;
  }

  let title = "";
  let description = "";

  if (notificationType === 'initial') {
    title = "Pending Orders Notification";
    description = `You have ${pendingOrdersCount} order(s) with "Pending" status that require your attention.`;
  } else if (notificationType === 'newOrder') {
    title = "New Order Received!";
    description = `A new order has been placed. You now have ${pendingOrdersCount} total pending order(s).`;
  }


  return (
    <AlertDialog open={showNotificationModal} onOpenChange={(open) => {if(!open) handleDismissModal();}}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <BellRing className={`h-6 w-6 mr-2 text-primary ${notificationType === 'newOrder' ? 'animate-pulse' : ''}`} />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDismissModal}>Dismiss</AlertDialogCancel>
          <AlertDialogAction asChild onClick={handleViewOrders}>
            <Link href="/admin/orders">View Orders</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
