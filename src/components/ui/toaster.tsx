
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, duration, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
            {duration && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-md overflow-hidden">
                <div
                  className={cn(
                    "h-full",
                    variant === "destructive" ? "bg-destructive-foreground/70" : "bg-primary/70"
                  )}
                  style={{
                    animation: `toast-progress-bar ${duration / 1000}s linear forwards`,
                    width: '100%', 
                  }}
                />
              </div>
            )}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
