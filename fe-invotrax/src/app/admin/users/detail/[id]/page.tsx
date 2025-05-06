'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Edit, User, Trash, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/ui/navbar';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
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
import { toast } from '@/hooks/use-toast';

interface UserDetail {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  company_name: string;
  role: string;
}

export default function UserDetailPage() {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const { logout } = useAuth();

  useEffect(() => {
    const fetchUserDetail = async () => {
      if (!userId) {
        setError("User ID not found");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get the authentication token from local storage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication token not found');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Unauthorized: Please login again');
          } else if (response.status === 404) {
            setError(`User with ID ${userId} not found`);
          } else {
            setError(`Error: ${response.status}`);
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setUser(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user detail:', err);
        setError('Failed to load user detail. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetail();
  }, [userId]);

  // Function to handle user deletion
  const handleDeleteUser = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      // Get the authentication token from local storage
      const token = localStorage.getItem('token');
      
      if (!token || !user) {
        setDeleteError('Authentication token not found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Try to parse the response as JSON
      let data;
      try {
        data = await response.json();
      } catch (e) {
        // If the response is not JSON, we'll just use the status text
        data = { status: response.statusText };
      }

      if (!response.ok) {
        // Handle error based on API response
        if (data && data.error) {
          throw new Error(data.error);
        } else {
          throw new Error('Failed to delete user account');
        }
      }

      // Success! User deleted
      toast({
        title: "User Deleted",
        description: `${user.username}'s account has been successfully deleted.`,
        variant: "default",
      });
      
      // Return to the users list page
      router.push('/admin/users/list');
      
    } catch (err) {
      console.error('Error deleting user:', err);
      setDeleteError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsDeleteDialogOpen(true); // Keep dialog open to show error
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to get initials from username
  const getInitials = (username: string) => {
    return username?.substring(0, 2).toUpperCase() || 'NA';
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="pb-4">
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>There was a problem loading the user profile</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
            <Button variant="outline" onClick={() => router.push('/admin/users/list')}>Back to Users</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Profile display
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-xl">
              InvoTrax
            </Link>
            <Navbar></Navbar>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="#"
              onClick={logout} 
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>
      <div className="flex-grow flex items-center justify-center">
        <div className="container mx-auto py-auto">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Profile</CardTitle>
                  <CardDescription>{user?.username}'s User Profile</CardDescription>
                </div>
                <Badge variant="outline" className="capitalize">
                  {user?.role || 'Unknown'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`} alt={user?.username} />
                  <AvatarFallback>{user?.username ? getInitials(user.username) : <User />}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{user?.username}</h3>
                  <p className="text-sm text-muted-foreground">ID: {user?.id}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm col-span-2">{user?.email}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm col-span-2">{user?.phone_number}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  <p className="text-sm font-medium">Company</p>
                  <p className="text-sm col-span-2">{user?.company_name}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push('/admin/users/list')}>
                Back to Users
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete User
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteError ? (
                <div className="flex items-center text-destructive">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Unable to Delete User
                </div>
              ) : (
                `Are you sure you want to delete ${user?.username}'s account?`
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteError ? (
                <div className="text-destructive">{deleteError}</div>
              ) : (
                "This action cannot be undone. This will permanently delete the user account and remove all associated data from the system."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            {!deleteError && (
              <AlertDialogAction 
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteUser();
                }} 
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete User"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}