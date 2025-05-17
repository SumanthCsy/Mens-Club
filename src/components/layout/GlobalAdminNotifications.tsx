
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
import { BellRing, Bell, BellOff } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Unsubscribe, doc, getDoc } from "firebase/firestore";
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserData } from '@/types';
import { useToast } from '@/hooks/use-toast';

const newOrderMessages = [
  "New order Received ✅",
  "You received a new order 🔔"
];

export function GlobalAdminNotifications() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [showInitialPendingOrderModal, setShowInitialPendingOrderModal] = useState(false);
  const [hasShownInitialPendingOrderModalThisSession, setHasShownInitialPendingOrderModalThisSession] = useState(false);
  const previousPendingOrdersCountRef = useRef<number | null>(null);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [lastNotificationMessageIndex, setLastNotificationMessageIndex] = useState(0);
  const { toast } = useToast();

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
            const isAdminUser = userData.role === 'admin';
            setIsAdmin(isAdminUser);
            if (isAdminUser && typeof window !== 'undefined' && 'Notification' in window) {
              setNotificationPermission(Notification.permission);
            }
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user role for global notifications:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
        setHasShownInitialPendingOrderModalThisSession(false);
        previousPendingOrdersCountRef.current = null;
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

        if (previousPendingOrdersCountRef.current === null) { // First time loading for this admin session
          previousPendingOrdersCountRef.current = currentCount;
          if (currentCount > 0 && !hasShownInitialPendingOrderModalThisSession) {
            setShowInitialPendingOrderModal(true);
          }
        } else if (currentCount > (previousPendingOrdersCountRef.current ?? 0)) { // New order(s) arrived
          if (notificationPermission === 'granted') {
            const message = newOrderMessages[lastNotificationMessageIndex];
            new Notification(message, { icon: '/mclogo.png', body: 'A new order requires your attention.' });
            setLastNotificationMessageIndex((prevIndex) => (prevIndex + 1) % newOrderMessages.length);
            const audio = new Audio('/success.mp3');
            audio.play().catch(error => {
              console.warn("Audio autoplay prevented for new order notification:", error);
            });
          } else if (notificationPermission === 'default') {
            // Optionally, remind admin to enable notifications if they haven't interacted with the prompt yet.
            // This could be a less intrusive toast or a small banner.
            toast({
                title: "New Order Received!",
                description: "Enable browser notifications to get instant alerts.",
                action: <Button onClick={requestBrowserNotificationPermission} size="sm">Enable</Button>,
                duration: 10000
            })
          }
           // Log for admin if notifications aren't granted but a new order came in
           console.log("New order arrived, but browser notifications are not granted. Current permission:", notificationPermission);
        }
        previousPendingOrdersCountRef.current = currentCount;
      }, (error) => {
        console.error("Error fetching pending orders for global notification:", error);
      });
    } else {
      setPendingOrdersCount(0);
      setShowInitialPendingOrderModal(false);
      previousPendingOrdersCountRef.current = null;
    }

    return () => {
      if (unsubscribeOrders) {
        unsubscribeOrders();
      }
    };
  }, [isAdmin, currentUser, isLoadingAuth, hasShownInitialPendingOrderModalThisSession, notificationPermission, lastNotificationMessageIndex, toast]);

  const requestBrowserNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({ title: "Unsupported", description: "This browser does not support desktop notifications.", variant: "destructive" });
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      toast({ title: "Notifications Enabled!", description: "You'll now receive new order alerts." });
    } else if (permission === 'denied') {
      toast({ title: "Notifications Blocked", description: "Please enable notifications in your browser settings if you want new order alerts.", variant: "default", duration: 7000 });
    }
  };

  const handleDismissInitialModal = () => {
    setHasShownInitialPendingOrderModalThisSession(true);
    setShowInitialPendingOrderModal(false);
  };
  
  const handleViewOrdersFromInitialModal = () => {
    setHasShownInitialPendingOrderModalThisSession(true);
    setShowInitialPendingOrderModal(false);
  };

  if (isLoadingAuth) {
    return null; // Or a very subtle loader if preferred
  }
  
  const renderPermissionRequester = () => {
    if (isAdmin && notificationPermission === 'default') {
      return (
        <div className="fixed bottom-4 left-4 z-50 bg-background border border-border shadow-lg rounded-lg p-3 max-w-sm text-sm">
          <p className="text-foreground mb-2">Enable browser notifications to get instant alerts for new orders.</p>
          <Button onClick={requestBrowserNotificationPermission} size="sm" className="w-full">
            <Bell className="mr-2 h-4 w-4"/> Enable Notifications
          </Button>
        </div>
      );
    }
     if (isAdmin && notificationPermission === 'denied') {
       // Optionally show a persistent but less intrusive message if denied
        return (
             <div className="fixed bottom-4 left-4 z-50 bg-muted border border-border shadow-lg rounded-lg p-3 max-w-sm text-xs text-muted-foreground">
                <BellOff className="inline mr-1 h-3 w-3"/> Browser notifications are disabled. You might miss new order alerts.
            </div>
        )
    }
    return null;
  };

  return (
    <>
      {renderPermissionRequester()}
      {isAdmin && showInitialPendingOrderModal && pendingOrdersCount > 0 && (
        <AlertDialog open={showInitialPendingOrderModal} onOpenChange={(open) => {if(!open) handleDismissInitialModal();}}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <BellRing className="h-6 w-6 mr-2 text-primary" />
                Pending Orders Notification
              </AlertDialogTitle>
              <AlertDialogDescription>
                You have {pendingOrdersCount} order(s) with "Pending" status that require your attention.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDismissInitialModal}>Dismiss</AlertDialogCancel>
              <AlertDialogAction asChild onClick={handleViewOrdersFromInitialModal}>
                <Link href="/admin/orders">View Orders</Link>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
