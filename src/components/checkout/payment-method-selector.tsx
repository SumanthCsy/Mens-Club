// @/components/checkout/payment-method-selector.tsx
"use client";

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Truck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

const paymentOptions = [
  { 
    id: 'online', 
    label: 'Online Payment', 
    description: 'Credit/Debit Card, UPI, Net Banking. (Temporarily Unavailable)',
    icon: CreditCard,
    disabled: true,
  },
  { 
    id: 'cod', 
    label: 'Cash on Delivery (COD)', 
    description: 'Pay in cash when your order is delivered.',
    icon: Truck,
    disabled: false,
  },
];

export function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  return (
    <Card className="shadow-lg border border-border/60">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Payment Method</CardTitle>
        <CardDescription>Choose how you'd like to pay for your order.</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedMethod}
          onValueChange={onMethodChange}
          className="space-y-4"
          // defaultValue="cod" // Ensure COD is default if online is unavailable
        >
          {paymentOptions.map((option) => (
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
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>
        {paymentOptions.find(opt => opt.id === 'online' && opt.disabled) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md text-yellow-700 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
            <p className="text-sm">Online payment methods are temporarily unavailable. Please select Cash on Delivery. We apologize for any inconvenience.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
