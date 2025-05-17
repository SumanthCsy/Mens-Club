
// @/components/orders/OrderTrackingModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Package, Settings2, Truck, PackageCheck, X } from "lucide-react";
import type { Order } from "@/types";
import { cn } from "@/lib/utils";

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const trackingSteps = [
  { id: 'Pending', label: "Order Placed", icon: Package, statuses: ["Pending"] },
  { id: 'Processing', label: "Processing", icon: Settings2, statuses: ["Processing"] },
  { id: 'Shipped', label: "Shipped", icon: Truck, statuses: ["Shipped"] },
  { id: 'Delivered', label: "Delivered", icon: PackageCheck, statuses: ["Delivered"] },
];

// A simplified mapping for demonstration. Real tracking involves more granular steps.
const statusOrder: Order['status'][] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];


export function OrderTrackingModal({ isOpen, onClose, order }: OrderTrackingModalProps) {
  if (!order) return null;

  const currentStatusIndex = statusOrder.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold break-all">
            Track Order: #{order.id || 'N/A'}
          </DialogTitle>
          <DialogDescription>
            Current status: <span className={cn(
              "font-semibold",
              isCancelled ? "text-destructive" : "text-primary"
            )}>{order.status}</span>
          </DialogDescription>
        </DialogHeader>

        {isCancelled ? (
          <div className="py-8 text-center">
            <X className="mx-auto h-16 w-16 text-destructive mb-4" />
            <p className="text-xl font-semibold text-destructive">Order Cancelled</p>
            <p className="text-muted-foreground">This order has been cancelled.</p>
          </div>
        ) : (
          <div className="space-y-8 py-6 px-2 overflow-y-auto max-h-[60vh]">
            {trackingSteps.map((step, index) => {
              const stepStatusIndex = statusOrder.indexOf(step.statuses[0] as Order['status']);
              const isActive = step.statuses.includes(order.status);
              const isCompleted = currentStatusIndex >= stepStatusIndex && currentStatusIndex >=0 && stepStatusIndex >=0;

              return (
                <div key={step.id} className="flex items-start gap-4">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2",
                    isActive ? "bg-primary border-primary text-primary-foreground animate-pulse" : "",
                    isCompleted ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-border text-muted-foreground",
                    !isCompleted && !isActive ? "opacity-50" : ""
                  )}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className={cn("pt-1.5 flex-1", !isCompleted && !isActive ? "opacity-60" : "")}>
                    <h4 className={cn(
                      "text-md font-semibold",
                       isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.label}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {/* Placeholder for date/time or more info */}
                      {isActive && "Current status"}
                      {isCompleted && !isActive && "Completed"}
                      {!isCompleted && !isActive && "Pending"}
                    </p>
                  </div>
                  {index < trackingSteps.length - 1 && (
                     <div className={cn(
                        "absolute left-[1.1875rem] top-[3.5rem] h-[calc(100%-2.5rem)] w-0.5",
                        isCompleted ? "bg-primary" : "bg-border",
                        index === trackingSteps.length -2 && isCompleted && currentStatusIndex !== statusOrder.indexOf('Delivered') ? "bg-primary" : "" // Ensure line to last active step is colored
                     )} style={{ zIndex: -1 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onClose} className="mt-4 w-full">
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

