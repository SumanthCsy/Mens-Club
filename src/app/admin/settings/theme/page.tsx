
// @/app/admin/settings/theme/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Palette, Moon, Sun, Check, Save, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ThemeSettings } from '@/types';
import { cn } from '@/lib/utils';

const themeColors = [
  { name: 'Default (Teal)', value: 'default', primaryHsl: '180 100% 25.1%', accentHsl: '180 100% 25.1%', bgHsl: '0 0% 98%' },
  { name: 'Sky Blue', value: 'sky-blue', primaryHsl: '200 100% 50%', accentHsl: '200 100% 50%', bgHsl: '210 40% 98%' },
  { name: 'Sunny Yellow', value: 'yellow', primaryHsl: '45 100% 50%', accentHsl: '45 100% 50%', bgHsl: '45 100% 97%' },
  { name: 'Classic Blue', value: 'blue', primaryHsl: '220 100% 50%', accentHsl: '220 100% 50%', bgHsl: '220 100% 97%' },
  { name: 'Lilac Purple', value: 'lilac', primaryHsl: '270 70% 60%', accentHsl: '270 70% 60%', bgHsl: '270 70% 97%' },
  { name: 'Lemon Green', value: 'lemon', primaryHsl: '80 60% 50%', accentHsl: '80 60% 50%', bgHsl: '80 60% 97%' },
  { name: 'Forest Green', value: 'green', primaryHsl: '120 60% 35%', accentHsl: '120 60% 35%', bgHsl: '120 60% 97%' },
];


export default function AdminThemeSettingsPage() {
  const [selectedColorName, setSelectedColorName] = useState<string>('default');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();

  // Function to apply theme to the document (for local preview)
  const applyThemeLocally = (colorName: string, darkMode: boolean) => {
    const colorOption = themeColors.find(c => c.value === colorName) || themeColors[0];
    document.documentElement.style.setProperty('--primary', colorOption.primaryHsl);
    document.documentElement.style.setProperty('--accent', colorOption.accentHsl);
    // Note: Changing --background directly can be tricky and might require more CSS adjustments.
    // For dark mode, we rely on Tailwind's 'dark' class.
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setSelectedColorName(colorName); // Update state for UI
    setIsDarkMode(darkMode); // Update state for UI
  };

  useEffect(() => {
    // Load saved settings from Firestore
    const fetchThemeSettings = async () => {
      setIsLoading(true);
      try {
        const settingsRef = doc(db, "settings", "themeConfiguration");
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as ThemeSettings;
          applyThemeLocally(data.selectedColor, data.displayMode === 'dark');
        } else {
          // Apply default theme if no settings found
          applyThemeLocally('default', false);
        }
      } catch (error) {
        console.error("Error fetching theme settings:", error);
        toast({ title: "Error", description: "Could not load theme settings.", variant: "destructive" });
        applyThemeLocally('default', false); // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchThemeSettings();
  }, [toast]);
  
  const handleColorChange = (value: string) => {
    applyThemeLocally(value, isDarkMode);
  };

  const handleDarkModeToggle = (checked: boolean) => {
    applyThemeLocally(selectedColorName, checked);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const settingsToSave: ThemeSettings = {
        selectedColor: selectedColorName,
        displayMode: isDarkMode ? 'dark' : 'light',
      };
      const settingsRef = doc(db, "settings", "themeConfiguration");
      await setDoc(settingsRef, settingsToSave);
      toast({
        title: "Theme Settings Saved (Simulated)",
        description: "Theme settings have been 'saved'. Applying these globally requires further backend and app-load logic.",
        duration: 7000,
      });
    } catch (error) {
      console.error("Error saving theme settings:", error);
      toast({ title: "Save Failed", description: "Could not save theme settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-8 text-center">Loading theme settings...</div>;
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
            <Palette className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Theme Customization</h1>
                <p className="mt-1 text-md text-muted-foreground">Customize the look and feel of your storefront.</p>
            </div>
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <CardHeader>
            <CardTitle>Store Theme Settings</CardTitle>
            <CardDescription>
                Select a color scheme and display mode. Changes are previewed live. 
                Saving these settings here is for demonstration; global application requires further development.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div>
                <Label className="text-lg font-semibold mb-3 block">Color Scheme</Label>
                <RadioGroup value={selectedColorName} onValueChange={handleColorChange} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {themeColors.map((color) => (
                        <Label
                            key={color.value}
                            htmlFor={`color-${color.value}`}
                            className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-md border-2 cursor-pointer transition-all hover:shadow-md",
                                selectedColorName === color.value ? "border-primary ring-2 ring-primary shadow-lg" : "border-border"
                            )}
                            style={{ 
                              // Directly apply a preview of the primary color to the border of the selection box
                              borderColor: selectedColorName === color.value ? `hsl(${color.primaryHsl})` : undefined 
                            }}
                        >
                             <RadioGroupItem value={color.value} id={`color-${color.value}`} className="sr-only" />
                             <div className="h-8 w-16 rounded mb-2" style={{ backgroundColor: `hsl(${color.primaryHsl})` }}></div>
                             <span className="text-sm font-medium">{color.name}</span>
                             {selectedColorName === color.value && <Check className="h-5 w-5 text-primary absolute top-2 right-2" />}
                        </Label>
                    ))}
                </RadioGroup>
            </div>
            
            <div>
                <Label className="text-lg font-semibold mb-3 block">Display Mode</Label>
                <div className="flex items-center space-x-3 p-4 border border-border/60 rounded-md">
                    <Sun className="h-6 w-6 text-yellow-500" />
                    <Switch
                        id="dark-mode-toggle"
                        checked={isDarkMode}
                        onCheckedChange={handleDarkModeToggle}
                        aria-label="Toggle dark mode"
                    />
                    <Moon className="h-6 w-6 text-blue-500" />
                     <span className="text-sm text-muted-foreground">
                        {isDarkMode ? "Dark Mode Enabled" : "Light Mode Enabled"}
                    </span>
                </div>
            </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button onClick={handleSaveChanges} disabled={isSaving} size="lg">
                {isSaving ? 'Saving...' : <><Save className="mr-2 h-5 w-5" /> Save Theme Settings (Simulated)</>}
            </Button>
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-md border border-border/50 max-w-md text-left">
                 <Info className="h-6 w-6 text-primary shrink-0 mt-0.5"/>
                 <p>
                    <strong>Note:</strong> Full global theme persistence requires backend integration.
                    Changes made and 'saved' here are primarily for live preview in your current session and to demonstrate saving settings to Firestore. 
                    The app's core `globals.css` is not dynamically altered by this action for all users.
                </p>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
