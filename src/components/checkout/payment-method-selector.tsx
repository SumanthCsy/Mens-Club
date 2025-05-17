
// @/components/checkout/payment-method-selector.tsx
"use client";

import { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Truck, AlertCircle, Loader2, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PaymentSettings } from '@/types';
import Image from 'next/image';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

const defaultPaymentOptionsConfig = {
  enableCOD: true,
  enableOnlinePayments: false,
  upiId: '',
  qrCodeUrl: '',
};

export function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const settingsRef = doc(db, "settings", "paymentConfiguration");
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) {
          setPaymentSettings(docSnap.data() as PaymentSettings);
        } else {
          setPaymentSettings(defaultPaymentOptionsConfig); // Fallback to defaults if not configured
        }
      } catch (error) {
        console.error("Error fetching payment settings for checkout:", error);
        setPaymentSettings(defaultPaymentOptionsConfig); // Fallback on error
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchPaymentSettings();
  }, []);

  if (isLoadingSettings) {
    return (
      <Card className="shadow-lg border border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin mb-2" />
          <p className="text-muted-foreground">Loading payment options...</p>
        </CardContent>
      </Card>
    );
  }

  const codOption = { 
    id: 'cod', 
    label: 'Cash on Delivery (COD)', 
    description: 'Pay in cash when your order is delivered.',
    icon: Truck,
    disabled: !paymentSettings?.enableCOD,
  };

  const onlineOption = {
    id: 'online', 
    label: 'Online Payment (UPI/QR)', 
    description: paymentSettings?.upiId 
                 ? `Pay using UPI ID: ${paymentSettings.upiId}` 
                 : 'Scan QR or use UPI. Details shown on next step if applicable.',
    icon: CreditCard,
    disabled: !paymentSettings?.enableOnlinePayments,
  };

  const availablePaymentOptions = [codOption, onlineOption].filter(opt => !opt.disabled);

  return (
    <Card className="shadow-lg border border-border/60">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Payment Method</CardTitle>
        <CardDescription>Choose how you'd like to pay for your order.</CardDescription>
      </CardHeader>
      <CardContent>
        {availablePaymentOptions.length > 0 ? (
          <RadioGroup
            value={selectedMethod}
            onValueChange={onMethodChange}
            className="space-y-4"
            defaultValue={availablePaymentOptions.find(opt => !opt.disabled)?.id || ''}
          >
            {availablePaymentOptions.map((option) => (
              <Label
                key={option.id}
                htmlFor={`payment-${option.id}`}
                className={cn(
                  "flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg border p-4 transition-all",
                  option.disabled 
                    ? "cursor-not-allowed bg-muted/50 text-muted-foreground" 
                    : "cursor-pointer hover:border-primary/80",
                  selectedMethod === option.id && !option.disabled ? "border-primary ring-2 ring-primary bg-primary/5" : "border-border bg-card"
                )}
              >
                <RadioGroupItem 
                  value={option.id} 
                  id={`payment-${option.id}`} 
                  className="mt-1 sm:mt-0"
                  disabled={option.disabled}
                />
                <div className="flex items-center gap-3">
                  <option.icon className={cn(
                    "h-6 w-6 shrink-0", 
                    option.disabled ? "text-muted-foreground" : (selectedMethod === option.id ? "text-primary" : "text-muted-foreground")
                  )} />
                  <div>
                    <span className={cn(
                      "block text-base font-medium", 
                      option.disabled ? "text-muted-foreground" : (selectedMethod === option.id ? "text-primary" : "text-foreground")
                    )}>
                      {option.label}
                    </span>
                    <span className={cn("block text-sm", option.disabled ? "text-muted-foreground" : "text-muted-foreground")}>
                      {option.description}
                    </span>
                    {option.id === 'online' && paymentSettings?.enableOnlinePayments && paymentSettings.qrCodeUrl && (
                       <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Scan QR to Pay:</p>
                        <Image 
                            src={paymentSettings.qrCodeUrl} 
                            alt="Payment QR Code" 
                            width={100} 
                            height={100} 
                            className="rounded-md border border-border/50"
                            data-ai-hint="payment qr"
                        />
                       </div>
                    )}
                  </div>
                </div>
              </Label>
            ))}
          </RadioGroup>
        ) : (
           <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
            <p className="text-sm">No payment methods are currently enabled. Please contact support.</p>
          </div>
        )}
        
        {paymentSettings?.enableOnlinePayments && !paymentSettings.upiId && !paymentSettings.qrCodeUrl && (
             <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md text-yellow-700 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                <p className="text-sm">Online payment details (UPI/QR) are not fully configured by the admin. Please choose COD if available, or contact support.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
