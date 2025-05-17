// @/components/layout/GlobalAdminNotifications.tsx
"use client";

import { useState, useEffect } from 'react';
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
  const [showModal, setShowModal] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [hasShownModalThisSession, setHasShownModalThisSession] = useState(false);

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
          console.error("Error fetching user role:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
        setHasShownModalThisSession(false); // Reset modal shown flag on logout
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeOrders: Unsubscribe | undefined;

    if (isAdmin && currentUser && !isLoadingAuth) {
      setIsLoadingOrders(true);
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("status", "==", "Pending"));

      unsubscribeOrders = onSnapshot(q, (querySnapshot) => {
        const count = querySnapshot.size;
        setPendingOrdersCount(count);
        if (count > 0 && !hasShownModalThisSession) {
          setShowModal(true);
        } else {
          setShowModal(false); // Ensure modal closes if count drops to 0 or already shown
        }
        setIsLoadingOrders(false);
      }, (error) => {
        console.error("Error fetching pending orders for global notification:", error);
        setIsLoadingOrders(false);
      });
    } else {
      setPendingOrdersCount(0); // Reset count if not admin or not logged in
      setShowModal(false);
    }

    return () => {
      if (unsubscribeOrders) {
        unsubscribeOrders();
      }
    };
  }, [isAdmin, currentUser, isLoadingAuth, hasShownModalThisSession]);

  const handleDismissModal = () => {
    setShowModal(false);
    setHasShownModalThisSession(true);
  };
  
  const handleViewOrders = () => {
    setShowModal(false);
    setHasShownModalThisSession(true);
    // Navigation will be handled by the Link component
  };


  if (isLoadingAuth || (isAdmin && isLoadingOrders && !hasShownModalThisSession && pendingOrdersCount === 0)) {
    // Optionally show a very subtle loader or nothing if preferred to avoid layout shift
    // For now, let's render nothing to avoid interrupting the user if not an admin or no pending orders initially.
    return null;
  }

  if (!isAdmin || pendingOrdersCount === 0 || !showModal) {
    return null;
  }

  return (
    <AlertDialog open={showModal} onOpenChange={(open) => {if(!open) handleDismissModal();}}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <BellRing className="h-6 w-6 mr-2 text-primary animate-pulse" />
            Pending Orders Notification
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have {pendingOrdersCount} order(s) with "Pending" status that require your attention.
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
