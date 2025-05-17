// @/app/admin/settings/payments/page.tsx
"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, CreditCard, Save, UploadCloud, IndianRupee, AlertTriangle, Info, Loader2, Trash2, ImagePlus, XCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PaymentSettings } from '@/types';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const initialPaymentSettings: PaymentSettings = {
  enableCOD: true,
  enableOnlinePayments: false, 
  upiId: '',
  qrCodeUrl: '', 
};

export default function AdminPaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>(initialPaymentSettings);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      setIsLoading(true);
      try {
        const settingsRef = doc(db, "settings", "paymentConfiguration");
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) {
          const fetchedSettings = docSnap.data() as PaymentSettings;
          setSettings(fetchedSettings);
          if (fetchedSettings.qrCodeUrl && fetchedSettings.qrCodeUrl.startsWith('data:image')) {
            setQrCodePreview(fetchedSettings.qrCodeUrl);
          } else if (fetchedSettings.qrCodeUrl) {
            // If it's a URL, keep it as is for external image, but preview might not work if not data URI
            setQrCodePreview(null); // Or attempt to load if it's a direct image URL, but safer to nullify for preview if not data URI
          }
        } else {
          await setDoc(settingsRef, initialPaymentSettings);
          setSettings(initialPaymentSettings);
        }
      } catch (error) {
        console.error("Error fetching payment settings:", error);
        toast({ title: "Error", description: "Could not load payment settings.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaymentSettings();
  }, [toast]);

  const handleSettingChange = (key: keyof PaymentSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleQrCodeUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setQrCodePreview(dataUrl);
        setSettings(prev => ({ ...prev, qrCodeUrl: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveQrCode = () => {
    setQrCodePreview(null);
    setSettings(prev => ({ ...prev, qrCodeUrl: '' }));
    const qrInput = document.getElementById('qrCodeFile') as HTMLInputElement;
    if (qrInput) qrInput.value = ''; // Reset file input
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const settingsRef = doc(db, "settings", "paymentConfiguration");
      // Ensure qrCodeUrl is the dataURI from preview if one exists, else from settings
      const settingsToSave = { ...settings, qrCodeUrl: qrCodePreview || settings.qrCodeUrl || '' };
      await setDoc(settingsRef, settingsToSave);
      toast({ title: "Settings Saved", description: "Payment settings have been updated." });
    } catch (error) {
      console.error("Error saving payment settings:", error);
      toast({ title: "Save Failed", description: "Could not save payment settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearOnlineDetails = async () => {
    setIsSaving(true); // Use isSaving to disable button during operation
    try {
        const newSettings = { ...settings, upiId: '', qrCodeUrl: '' };
        const settingsRef = doc(db, "settings", "paymentConfiguration");
        await updateDoc(settingsRef, { upiId: '', qrCodeUrl: '' }); // Only update these fields
        setSettings(newSettings);
        setQrCodePreview(null); // Clear preview as well
        const qrInput = document.getElementById('qrCodeFile') as HTMLInputElement;
        if (qrInput) qrInput.value = '';
        toast({ title: "Online Details Cleared", description: "UPI ID and QR Code have been cleared. Save settings to persist." });
    } catch (error) {
        console.error("Error clearing online payment details:", error);
        toast({ title: "Clear Failed", description: "Could not clear online payment details.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
};


  if (isLoading) {
    return <div className="container mx-auto p-8 text-center"> <Loader2 className="mx-auto h-8 w-8 animate-spin mb-2"/> Loading payment settings...</div>;
  }

  return (
    <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-3">
            <CreditCard className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Payment Settings</h1>
                <p className="mt-1 text-md text-muted-foreground">Configure payment gateways and methods for your store.</p>
            </div>
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <CardHeader>
            <CardTitle>Payment Method Configuration</CardTitle>
            <CardDescription>Enable or disable payment options and manage details for online payments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="p-4 border border-border/50 rounded-lg bg-card space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="enableCOD" className="text-lg font-medium flex items-center gap-2">
                        <IndianRupee className="h-5 w-5"/> Cash on Delivery (COD)
                    </Label>
                    <Switch
                        id="enableCOD"
                        checked={settings.enableCOD}
                        onCheckedChange={(checked) => handleSettingChange('enableCOD', checked)}
                        aria-label="Toggle Cash on Delivery"
                    />
                </div>
                <p className="text-sm text-muted-foreground">
                    Allow customers to pay in cash when their order is delivered.
                </p>
            </div>

            <Separator />

            <div className="p-4 border border-border/50 rounded-lg bg-card space-y-6">
                <div className="flex items-center justify-between">
                    <Label htmlFor="enableOnlinePayments" className="text-lg font-medium flex items-center gap-2">
                       <CreditCard className="h-5 w-5"/> Online Payments (UPI/QR)
                    </Label>
                     <Switch
                        id="enableOnlinePayments"
                        checked={settings.enableOnlinePayments}
                        onCheckedChange={(checked) => handleSettingChange('enableOnlinePayments', checked)}
                        aria-label="Toggle Online Payments"
                    />
                </div>
                 <p className="text-sm text-muted-foreground">
                    Enable customers to pay using UPI or by scanning a QR code. (Full gateway integration is a future step).
                </p>

                {settings.enableOnlinePayments && (
                    <div className="space-y-6 pl-4 border-l-2 border-primary/50 ml-2 pt-2 pb-2">
                        <div className="space-y-2">
                            <Label htmlFor="upiId">UPI ID</Label>
                            <Input 
                                id="upiId" 
                                value={settings.upiId || ''}
                                onChange={(e) => handleSettingChange('upiId', e.target.value)}
                                placeholder="yourname@okhdfcbank"
                                className="text-base h-11"
                            />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="qrCodeFile">Upload QR Code Image (Optional)</Label>
                          <div className="flex items-center gap-4">
                            <Input
                              id="qrCodeFile"
                              type="file"
                              accept="image/*"
                              onChange={handleQrCodeUpload}
                              className="text-base h-11 flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                            <ImagePlus className="h-6 w-6 text-muted-foreground"/>
                          </div>
                          {qrCodePreview && (
                            <div className="mt-3 p-2 border border-dashed border-border rounded-md inline-block relative bg-muted/30">
                              <Image 
                                src={qrCodePreview} 
                                alt="QR Code Preview" 
                                width={120}
                                height={120}
                                className="object-contain rounded"
                              />
                               <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 bg-red-500/70 text-white hover:bg-red-600"
                                onClick={handleRemoveQrCode}
                                title="Remove QR Code"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                           <p className="text-xs text-muted-foreground">
                              Upload your UPI QR code image. This will be displayed to customers if Online Payments are enabled.
                              Stored as a data URI in Firestore.
                          </p>
                        </div>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4"/> Clear UPI & QR Details
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will clear the currently entered UPI ID and remove the uploaded QR code from the form. 
                                    You will need to click "Save Payment Settings" to make this change permanent.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearOnlineDetails} className="bg-destructive hover:bg-destructive/90">
                                    Yes, Clear Details
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>


                         <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-200">
                            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5"/>
                            <p>
                                <strong>Important:</strong> This online payment setup is a simplified version. Users will see your UPI ID/QR details to make a manual payment. 
                                Automatic payment confirmation and full gateway integration (like Stripe, Razorpay) are not part of this current setup.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button onClick={handleSaveChanges} disabled={isSaving || isLoading} size="lg">
                {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                Save Payment Settings
            </Button>
             <div className="flex items-start gap-2 text-xs text-muted-foreground max-w-md text-left">
                 <Info className="h-4 w-4 text-primary shrink-0 mt-0.5"/>
                 <p>
                    Changes saved here will affect the payment options available to customers during checkout.
                </p>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
