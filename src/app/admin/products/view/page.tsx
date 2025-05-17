
// @/app/admin/products/view/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Edit, Trash2, Eye, PlusCircle, PackageSearch, Loader2, AlertTriangle, Filter } from 'lucide-react';
import type { Product } from '@/types';
import { collection, query, orderBy, doc, deleteDoc, onSnapshot, Unsubscribe, writeBatch, getDocs, where } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const productCategories = [
  "All Categories",
  "New Arrivals",
  "Formals & Casuals",
  "Trendy",
  "Jeans",
  "T-shirts",
  "Others",
  "Limited Time Offers"
];

export default function ViewProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);
  const { toast } = useToast();

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false);

  const [selectedCategoryForDeletion, setSelectedCategoryForDeletion] = useState<string>("All Categories");
  const [showDeleteByCategoryConfirm, setShowDeleteByCategoryConfirm] = useState(false);
  const [isDeletingByCategory, setIsDeletingByCategory] = useState(false);


  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const productsCol = collection(db, "products");
    const q = query(productsCol, orderBy("name"));

    const unsubscribe: Unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      setProducts(productList);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching products with onSnapshot:", err);
      setError("Failed to load products in real-time.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteSingleProduct = async () => {
    if (!productToDelete) return;
    setIsDeletingSingle(true);
    try {
      await deleteDoc(doc(db, "products", productToDelete.id));
      toast({
        title: "Product Deleted!",
        description: `${productToDelete.name} has been successfully deleted.`,
      });
      setProductToDelete(null); // Close dialog
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error Deleting Product",
        description: `Could not delete ${productToDelete.name}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsDeletingSingle(false);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts(prevSelected =>
      checked ? [...prevSelected, productId] : prevSelected.filter(id => id !== productId)
    );
  };

  const handleSelectAllProducts = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(product => product.id!));
    } else {
      setSelectedProducts([]);
    }
  };

  const isAllSelected = useMemo(() => {
    if (products.length === 0) return false;
    return selectedProducts.length === products.length;
  }, [selectedProducts, products]);

  const handleDeleteSelectedProducts = async () => {
    if (selectedProducts.length === 0) return;
    setIsDeletingSelected(true);
    try {
      const batch = writeBatch(db);
      selectedProducts.forEach(productId => {
        batch.delete(doc(db, "products", productId));
      });
      await batch.commit();

      toast({
        title: "Products Deleted",
        description: `${selectedProducts.length} product(s) have been permanently deleted.`,
      });
      setSelectedProducts([]);
    } catch (err) {
      console.error("Error deleting selected products:", err);
      toast({
        title: "Deletion Failed",
        description: "Could not delete selected products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingSelected(false);
      setShowDeleteSelectedConfirm(false);
    }
  };

  const handleDeleteByCategory = async () => {
    if (selectedCategoryForDeletion === "All Categories") {
        toast({ title: "Invalid Selection", description: "Please select a specific category to delete.", variant: "destructive" });
        return;
    }
    setIsDeletingByCategory(true);
    // This is a placeholder for the actual deletion logic, which is complex.
    // For now, it will just show a message.
    console.log(`Simulating deletion of all products in category: ${selectedCategoryForDeletion}`);
    // In a real implementation, you would query products by category and batch delete them.
    // e.g., const q = query(collection(db, "products"), where("category", "==", selectedCategoryForDeletion));
    // const snapshot = await getDocs(q);
    // const batch = writeBatch(db);
    // snapshot.docs.forEach(doc => batch.delete(doc.ref));
    // await batch.commit();
    
    setTimeout(() => { // Simulate async operation
        toast({
            title: "Delete by Category (Simulated)",
            description: `Deletion for category '${selectedCategoryForDeletion}' is a feature under active development and has been simulated. No actual data was deleted.`,
            duration: 10000,
        });
        setIsDeletingByCategory(false);
        setShowDeleteByCategoryConfirm(false);
    }, 1500);
  };


  if (isLoading) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
                <PackageSearch className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Manage Products</h1>
                    <p className="mt-1 text-md text-muted-foreground">View, edit, or delete existing products. Updates in real-time.</p>
                </div>
            </div>
            <Button asChild>
                <Link href="/admin/products/add">
                    <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
                </Link>
            </Button>
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-card border border-border/60 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-grow flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedCategoryForDeletion} onValueChange={setSelectedCategoryForDeletion}>
              <SelectTrigger className="w-full sm:w-[250px] h-10 text-base">
                <SelectValue placeholder="Select category to delete" />
              </SelectTrigger>
              <SelectContent>
                {productCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
                variant="destructive" 
                onClick={() => setShowDeleteByCategoryConfirm(true)} 
                disabled={selectedCategoryForDeletion === "All Categories" || isDeletingByCategory}
                className="h-10"
            >
              {isDeletingByCategory ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4"/>}
              Delete by Category
            </Button>
          </div>

          {selectedProducts.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteSelectedConfirm(true)}
              disabled={isDeletingSelected}
              className="w-full sm:w-auto h-10"
            >
              {isDeletingSelected ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Selected ({selectedProducts.length})
            </Button>
          )}
        </div>
      </div>


      <Card className="shadow-xl border-border/60">
        <CardHeader>
          <CardTitle>All Products ({products.length})</CardTitle>
          <CardDescription>A list of all products currently in your store. Sorted by name.</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-10">
              <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products found. Add new products to see them here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                       <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(checked) => handleSelectAllProducts(Boolean(checked))}
                        aria-label="Select all products"
                      />
                    </TableHead>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price (₹)</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-center w-[180px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} data-state={selectedProducts.includes(product.id!) ? "selected" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id!)}
                          onCheckedChange={(checked) => handleSelectProduct(product.id!, Boolean(checked))}
                          aria-label={`Select product ${product.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Image
                          src={product.imageUrl || 'https://placehold.co/60x80.png'}
                          alt={product.name}
                          width={50}
                          height={67}
                          className="rounded-md object-cover aspect-[3/4]"
                          data-ai-hint={product.dataAiHint || "product"}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category || 'N/A'}</TableCell>
                      <TableCell className="text-right">{product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{product.stock ?? 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="icon" asChild className="h-8 w-8">
                            <Link href={`/products/${product.id}`} target="_blank" title="View Product on Site">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon" asChild className="h-8 w-8">
                            <Link href={`/admin/products/edit/${product.id}`} title="Edit Product">
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setProductToDelete(product)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            {productToDelete && productToDelete.id === product.id && (
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the product "{productToDelete.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteSingleProduct} className="bg-destructive hover:bg-destructive/90" disabled={isDeletingSingle}>
                                  {isDeletingSingle && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Yes, delete product
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                            )}
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {products.length > 0 && (
          <CardFooter className="justify-end">
            <p className="text-sm text-muted-foreground">
              {selectedProducts.length} product(s) selected.
            </p>
          </CardFooter>
        )}
      </Card>

       {/* AlertDialog for Confirming Bulk Deletion of Selected Products */}
      {showDeleteSelectedConfirm && (
        <AlertDialog open={showDeleteSelectedConfirm} onOpenChange={setShowDeleteSelectedConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Bulk Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete {selectedProducts.length} selected product(s)? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSelectedProducts}
                disabled={isDeletingSelected}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeletingSelected && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, delete selected
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {/* AlertDialog for Confirming Delete by Category */}
      {showDeleteByCategoryConfirm && (
        <AlertDialog open={showDeleteByCategoryConfirm} onOpenChange={setShowDeleteByCategoryConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete by Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to attempt to delete all products in the category "{selectedCategoryForDeletion}"? 
                This is a feature under development and will be simulated. No actual data will be deleted in this step.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteByCategory}
                disabled={isDeletingByCategory}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeletingByCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Proceed with Simulation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
