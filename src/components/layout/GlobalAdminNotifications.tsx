
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
import { BellRing, Bell, BellOff, AlertTriangle } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Unsubscribe, doc, getDoc } from "firebase/firestore";
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserData } from '@/types';
import { useToast } from '@/hooks/use-toast';

const newOrderMessages = [
  "New order Received ✅",
  "You received a new order 🔔"
];

// **IMPORTANT**: Replace this with your actual VAPID public key
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_HERE'; // User needs to generate and replace this

async function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function GlobalAdminNotifications() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [showInitialPendingOrderModal, setShowInitialPendingOrderModal] = useState(false);
  const [hasShownInitialNotificationThisSession, setHasShownInitialNotificationThisSession] = useState(false);
  const previousPendingOrdersCountRef = useRef<number | null>(null);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [lastNotificationMessageIndex, setLastNotificationMessageIndex] = useState(0);
  const { toast } = useToast();
  const [isPushSupported, setIsPushSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsPushSupported(true);
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
            const isAdminUser = userData.role === 'admin';
            setIsAdmin(isAdminUser);
            if (isAdminUser && isPushSupported) {
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
        setHasShownInitialNotificationThisSession(false);
        previousPendingOrdersCountRef.current = null;
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribeAuth();
  }, [isPushSupported]);

  const subscribeUserToPush = async () => {
    if (!isPushSupported || !isAdmin) return;

    try {
      const swRegistration = await navigator.serviceWorker.register('/sw.js'); // User needs to create public/sw.js
      console.log('Service Worker registered:', swRegistration);

      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        toast({ title: "Browser Notifications Enabled!", description: "You'll now receive new order alerts." });
        
        if (VAPID_PUBLIC_KEY === 'YOUR_VAPID_PUBLIC_KEY_HERE') {
            console.warn("VAPID_PUBLIC_KEY is not set. Push subscription will fail or use browser's default sender.");
            toast({
                title: "Push Setup Incomplete",
                description: "VAPID public key is missing. Background push notifications might not work correctly.",
                variant: "destructive",
                duration: 10000
            });
        }
        
        const applicationServerKey = await urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        const subscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey,
        });
        
        console.log('User is subscribed to push notifications:', subscription);
        // TODO: Send this 'subscription' object to your backend and save it
        // (e.g., in Firestore under the admin's user document).
        // Example: await saveSubscriptionToBackend(subscription);
        toast({
            title: "Push Subscription (Simulated Save)",
            description: "Push subscription successful! (Backend save needed for actual background pushes).",
            duration: 7000
        });

      } else if (permission === 'denied') {
        toast({ title: "Notifications Blocked", description: "Please enable notifications in your browser settings if you want new order alerts.", variant: "default", duration: 7000 });
      }
    } catch (error) {
      console.error('Failed to subscribe the user to push notifications', error);
      toast({ title: "Push Subscription Failed", description: "Could not subscribe to push notifications. Check console.", variant: "destructive" });
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

        if (previousPendingOrdersCountRef.current === null) { // First time loading for this admin session
          previousPendingOrdersCountRef.current = currentCount;
          if (currentCount > 0 && !hasShownInitialNotificationThisSession) {
            setShowInitialPendingOrderModal(true);
          }
        } else if (currentCount > (previousPendingOrdersCountRef.current ?? 0)) { // New order(s) arrived
          // If push notifications are set up and granted, the backend should handle sending the push.
          // For in-browser notifications (when tab is active and push not fully set up or as fallback):
          if (notificationPermission === 'granted' && isPushSupported) {
            // This browser notification can still be useful if the admin has the tab open
            // but backend push might be delayed or for immediate visual cue.
            const message = newOrderMessages[lastNotificationMessageIndex];
            new Notification(message, { icon: '/mclogo.png', body: 'A new order requires your attention.' });
            setLastNotificationMessageIndex((prevIndex) => (prevIndex + 1) % newOrderMessages.length);
            const audio = new Audio('/success.mp3');
            audio.play().catch(error => {
              console.warn("Audio autoplay prevented for new order notification:", error);
            });
          } else if (notificationPermission === 'default' && isPushSupported) {
            toast({
                title: "New Order Received!",
                description: "Enable browser/push notifications for instant alerts.",
                action: <Button onClick={subscribeUserToPush} size="sm">Enable Notifications</Button>,
                duration: 10000
            });
          }
           console.log("New order arrived. Browser notifications permission:", notificationPermission, "Push supported:", isPushSupported);
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
  }, [isAdmin, currentUser, isLoadingAuth, hasShownInitialNotificationThisSession, notificationPermission, lastNotificationMessageIndex, toast, isPushSupported]);
  
  const renderPermissionRequester = () => {
    if (isAdmin && isPushSupported && notificationPermission === 'default') {
      return (
        <div className="fixed bottom-4 left-4 z-[101] bg-card border border-border shadow-lg rounded-lg p-4 max-w-md text-sm">
          <div className="flex items-start gap-3">
            <BellRing className="h-6 w-6 text-primary mt-0.5 shrink-0"/>
            <div>
              <p className="text-foreground font-medium mb-1">Get Real-Time Order Alerts!</p>
              <p className="text-muted-foreground mb-3 text-xs">Enable browser push notifications to receive instant alerts for new orders, even when the site isn't open.</p>
              <Button onClick={subscribeUserToPush} size="sm" className="w-full">
                Enable Notifications
              </Button>
            </div>
          </div>
        </div>
      );
    }
     if (isAdmin && isPushSupported && notificationPermission === 'denied') {
        return (
             <div className="fixed bottom-4 left-4 z-[101] bg-muted border border-border shadow-lg rounded-lg p-3 max-w-sm text-xs text-muted-foreground">
                <BellOff className="inline mr-1 h-3 w-3"/> Browser push notifications are disabled. You might miss new order alerts.
            </div>
        )
    }
    if (isAdmin && !isPushSupported && typeof window !== 'undefined') { // Check for window to avoid SSR issues
        return (
             <div className="fixed bottom-4 left-4 z-[101] bg-yellow-100 border border-yellow-300 text-yellow-700 shadow-lg rounded-lg p-3 max-w-sm text-xs">
                <AlertTriangle className="inline mr-1 h-3 w-3"/> Push notifications are not supported by this browser or setup.
            </div>
        )
    }
    return null;
  };

  return (
    <>
      {renderPermissionRequester()}
      {isAdmin && showInitialPendingOrderModal && pendingOrdersCount > 0 && (
        <AlertDialog open={showInitialPendingOrderModal} onOpenChange={(open) => {if(!open) {setShowInitialPendingOrderModal(false); setHasShownInitialNotificationThisSession(true);}}}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <BellRing className="h-6 w-6 mr-2 text-primary" />
                Pending Orders Alert
              </AlertDialogTitle>
              <AlertDialogDescription>
                You have {pendingOrdersCount} order(s) with "Pending" status that require your attention.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {setShowInitialPendingOrderModal(false); setHasShownInitialNotificationThisSession(true);}}>Dismiss</AlertDialogCancel>
              <AlertDialogAction asChild onClick={() => {setShowInitialPendingOrderModal(false); setHasShownInitialNotificationThisSession(true);}}>
                <Link href="/admin/orders">View Orders</Link>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
