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
import { cn } from '@/lib/utils';

const newOrderMessages = [
  "New order Received ✅",
  "You received a new order 🔔"
];

// **IMPORTANT**: Replace this with your actual VAPID public key for push notifications
// You can generate VAPID keys using: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_HERE'; 

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
  
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [alertModalType, setAlertModalType] = useState<'initial' | 'newOrder' | null>(null);
  const [hasShownInitialNotificationThisSession, setHasShownInitialNotificationThisSession] = useState(false);
  const previousPendingOrdersCountRef = useRef<number | null>(null);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [lastNotificationMessageIndex, setLastNotificationMessageIndex] = useState(0);
  const { toast } = useToast();
  const [isPushSupported, setIsPushSupported] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
        setIsPushSupported(true);
      }
      // Preload audio
      audioRef.current = new Audio('/success.mp3');
      audioRef.current.load(); // Explicitly load
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

  const playSuccessSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Rewind to start
      audioRef.current.play().catch(error => {
        console.warn("Audio autoplay prevented for new order notification:", error);
        toast({
          title: "Audio Alert Blocked by Browser",
          description: "The new order sound was blocked. Browsers often require interaction (like a click) before allowing sound. This is normal.",
          variant: "default",
          duration: 8000
        })
      });
    } else {
        console.warn("Audio element not ready or success.mp3 not found in /public folder.")
    }
  };


  const subscribeUserToPush = async () => {
    if (!isPushSupported || !isAdmin || !navigator.serviceWorker) return;

    try {
      if (VAPID_PUBLIC_KEY === 'YOUR_VAPID_PUBLIC_KEY_HERE') {
        console.warn("VAPID_PUBLIC_KEY is not set. Push subscription cannot proceed effectively.");
        toast({
            title: "Push Setup Incomplete",
            description: "VAPID public key is missing. Background push notifications might not work correctly.",
            variant: "destructive",
            duration: 10000
        });
        // Optionally, don't attempt to register SW if VAPID key is missing
        // return; 
      }

      const swRegistration = await navigator.serviceWorker.register('/sw.js'); 
      console.log('Service Worker registered:', swRegistration);

      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        toast({ title: "Browser Push Notifications Enabled!", description: "You'll now receive new order alerts." });
        
        const applicationServerKey = await urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        const subscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey,
        });
        
        console.log('User is subscribed to push notifications:', subscription);
        // TODO: Send this 'subscription' object to your backend and save it with the admin's user profile
        // Example: await fetch('/api/save-push-subscription', { method: 'POST', body: JSON.stringify(subscription), headers: {'Content-Type': 'application/json'} });
        toast({
            title: "Push Subscription (Simulated Save)",
            description: "Push subscription successful! Backend save needed for actual background pushes.",
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
          if (currentCount > 0 && !hasShownInitialNotificationThisSession) {
            setAlertModalType('initial');
            setShowNotificationModal(true);
          }
        } else if (currentCount > previousPendingOrdersCountRef.current) { // New order(s) arrived
          setAlertModalType('newOrder'); 
          setShowNotificationModal(true);
          playSuccessSound();
          
          if (notificationPermission === 'granted' && isPushSupported) {
            const message = newOrderMessages[lastNotificationMessageIndex];
            new Notification(message, { icon: '/mclogo.png', body: 'A new order requires your attention.' });
            setLastNotificationMessageIndex((prevIndex) => (prevIndex + 1) % newOrderMessages.length);
          } else if (notificationPermission === 'default' && isPushSupported) {
             toast({
                title: "New Order Arrived!",
                description: "Enable browser notifications for instant alerts even when this tab isn't active.",
                action: <Button onClick={subscribeUserToPush} size="sm">Enable Notifications</Button>,
                duration: 10000
            });
          }
           console.log("New order arrived. Browser notifications permission:", notificationPermission, "Push supported:", isPushSupported);
        }
        previousPendingOrdersCountRef.current = currentCount;
      }, (error) => {
        console.error("Error fetching pending orders for global notification:", error);
         toast({
          title: "Error Loading Pending Orders",
          description: "Could not update pending order count.",
          variant: "destructive"
        });
      });
    } else {
      setPendingOrdersCount(0);
      setShowNotificationModal(false);
      setAlertModalType(null);
      previousPendingOrdersCountRef.current = null; 
    }

    return () => {
      if (unsubscribeOrders) {
        unsubscribeOrders();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, currentUser, isLoadingAuth, hasShownInitialNotificationThisSession, notificationPermission, lastNotificationMessageIndex, toast, isPushSupported]);
  
  const renderPermissionRequester = () => {
    if (isAdmin && isPushSupported && notificationPermission === 'default') {
      return (
        <div className="fixed bottom-4 left-4 z-[101] bg-card border border-border shadow-lg rounded-lg p-4 max-w-md text-sm">
          <div className="flex items-start gap-3">
            <Bell className="h-6 w-6 text-primary mt-0.5 shrink-0"/>
            <div>
              <p className="text-foreground font-medium mb-1">Get Instant New Order Alerts!</p>
              <p className="text-muted-foreground mb-3 text-xs">Enable browser push notifications to be alerted of new orders, even when the site isn't focused.</p>
              <Button onClick={subscribeUserToPush} size="sm" className="w-full">
                Enable Push Notifications
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
    if (isAdmin && !isPushSupported && typeof window !== 'undefined') { 
        return (
             <div className="fixed bottom-4 left-4 z-[101] bg-yellow-100 border border-yellow-300 text-yellow-700 shadow-lg rounded-lg p-3 max-w-sm text-xs">
                <AlertTriangle className="inline mr-1 h-3 w-3"/> Push notifications are not supported by this browser or setup.
            </div>
        )
    }
    return null;
  };

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
      {renderPermissionRequester()}
      {(showNotificationModal && alertModalType) && (
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

