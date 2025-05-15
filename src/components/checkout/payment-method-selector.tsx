// @/components/checkout/payment-method-selector.tsx
"use client";

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Landmark, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

const paymentOptions = [
  { 
    id: 'online', 
    label: 'Online Payment', 
    description: 'Pay securely with Credit/Debit Card, UPI, or Net Banking.',
    icon: CreditCard 
  },
  { 
    id: 'cod', 
    label: 'Cash on Delivery (COD)', 
    description: 'Pay in cash when your order is delivered.',
    icon: Truck
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
        >
          {paymentOptions.map((option) => (
            <Label
              key={option.id}
              htmlFor={`payment-${option.id}`}
              className={cn(
                "flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all hover:border-primary/80",
                selectedMethod === option.id ? "border-primary ring-2 ring-primary bg-primary/5" : "border-border bg-card"
              )}
            >
              <RadioGroupItem value={option.id} id={`payment-${option.id}`} className="mt-1 sm:mt-0"/>
              <div className="flex items-center gap-3">
                <option.icon className={cn("h-6 w-6 shrink-0", selectedMethod === option.id ? "text-primary" : "text-muted-foreground")} />
                <div>
                  <span className={cn("block text-base font-medium", selectedMethod === option.id ? "text-primary" : "text-foreground")}>{option.label}</span>
                  <span className="block text-sm text-muted-foreground">{option.description}</span>
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
