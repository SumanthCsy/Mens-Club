
// @/app/admin/users/view/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, Loader2, AlertTriangle, Edit, Trash2, Eye } from 'lucide-react';
import type { UserData } from '@/types';
import { collection, getDocs, query, orderBy as firestoreOrderBy, Timestamp, doc, deleteDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
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

export default function AdminViewUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Tracks which user is being deleted
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const usersCol = collection(db, "users");
        const q = query(usersCol, firestoreOrderBy("memberSince", "desc"));
        const userSnapshot = await getDocs(q);
        const userList = userSnapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          let memberSinceString: string;
          if (data.memberSince) {
            if (data.memberSince instanceof Timestamp) {
              memberSinceString = data.memberSince.toDate().toISOString();
            } else if (typeof data.memberSince === 'string') {
              memberSinceString = data.memberSince;
            } else if (typeof data.memberSince === 'number') {
              memberSinceString = new Date(data.memberSince).toISOString();
            } else {
              console.warn(`Unexpected type for memberSince for user ${docSnapshot.id}:`, data.memberSince);
              memberSinceString = new Date(0).toISOString(); 
            }
          } else {
            memberSinceString = new Date().toISOString();
          }
          return {
            uid: docSnapshot.id,
            ...data,
            email: data.email || 'N/A',
            fullName: data.fullName || 'N/A',
            role: data.role || 'user',
            memberSince: memberSinceString,
          } as UserData;
        });
        setUsers(userList);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users. Please try again.");
        toast({
          title: "Error",
          description: "Could not load users from the database.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleDeleteUser = async (userId: string, userName: string) => {
    setIsDeleting(userId);
    try {
      // Delete user document from Firestore "users" collection
      await deleteDoc(doc(db, "users", userId));
      setUsers(prevUsers => prevUsers.filter(user => user.uid !== userId));
      toast({
        title: "User Data Deleted!",
        description: `User data for ${userName} has been removed from Firestore. Note: Their Auth account is not deleted by this action.`,
        duration: 7000,
      });
    } catch (error) {
      console.error("Error deleting user data:", error);
      toast({
        title: "Error Deleting User Data",
        description: `Could not delete data for ${userName}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading users...</p>
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
        <div className="flex items-center gap-3">
            <Users className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Manage Users</h1>
                <p className="mt-1 text-md text-muted-foreground">View and manage all registered user accounts.</p>
            </div>
        </div>
      </div>

      <Card className="shadow-xl border-border/60">
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
          <CardDescription>A list of all registered users in your store.</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-10">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Member Since</TableHead>
                    <TableHead className="text-center w-[180px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">{user.fullName || 'N/A'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full
                          ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : ''}
                          ${user.role === 'user' ? 'bg-blue-100 text-blue-700' : ''}
                        `}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.memberSince ? 
                          (() => {
                            try {
                                const dateObj = new Date(user.memberSince);
                                if (isNaN(dateObj.getTime())) {
                                return 'N/A (Invalid Date)';
                                }
                                return format(dateObj, 'PP');
                            } catch (e) {
                                console.error("Error formatting date for user.memberSince", user.memberSince, e);
                                return 'N/A (Format Error)';
                            }
                          })()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                            <Eye className="h-4 w-4" /> {/* Placeholder for View User Details */}
                          </Button>
                          <Button variant="outline" size="icon" asChild className="h-8 w-8">
                            <Link href={`/admin/users/edit/${user.uid}`} title="Edit User Data">
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon" className="h-8 w-8" disabled={isDeleting === user.uid}>
                                {isDeleting === user.uid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently delete the user data for "{user.fullName || user.email}" from Firestore. 
                                  It will NOT delete their Firebase Authentication account.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.uid, user.fullName || user.email)}
                                  className="bg-destructive hover:bg-destructive/90"
                                  disabled={isDeleting === user.uid}
                                >
                                  {isDeleting === user.uid ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                  Yes, delete user data
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
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
      </Card>
    </div>
  );
}
