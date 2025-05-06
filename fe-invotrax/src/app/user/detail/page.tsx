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
import { useRouter } from 'next/navigation';
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

interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  company_name: string;
  role: string;
}

export default function UserProfilePage() {
  const { getToken, isLoggedIn, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isLoggedIn) return;
      
      try {
        setIsLoading(true);
        const token = getToken();
        
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error fetching profile: ${response.status}`);
        }

        const data = await response.json();
        setProfile(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError('Failed to load user profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [isLoggedIn, getToken]);

  // Function to handle user deletion
  const handleDeleteUser = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      const token = getToken();
      
      if (!token || !profile) {
        setDeleteError('Authentication error');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/users/${profile.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error based on API response
        if (data.error) {
          throw new Error(data.error);
        } else {
          throw new Error('Failed to delete user account');
        }
      }

      // Success! User deleted
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
        variant: "default",
      });
      
      // Logout user and redirect to login page
      localStorage.removeItem('token'); // Remove token manually
      logout(); // Call logout function from AuthContext
      router.push('/login');
      
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
    return username.substring(0, 2).toUpperCase();
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
            <CardDescription>There was a problem loading your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
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
      <div className='flex-grow flex items-center justify-center'>
        <div className="container mx-auto py-auto">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Profile</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </div>
                <Badge variant="outline" className="capitalize">
                  {profile?.role || 'Unknown'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile?.username}`} alt={profile?.username} />
                  <AvatarFallback>{profile?.username ? getInitials(profile.username) : <User />}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{profile?.username}</h3>
                  <p className="text-sm text-muted-foreground">ID: {profile?.id}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm col-span-2">{profile?.email}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm col-span-2">{profile?.phone_number}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  <p className="text-sm font-medium">Company</p>
                  <p className="text-sm col-span-2">{profile?.company_name}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="default" onClick={() => router.push('/user/update')}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete Profile
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteError ? (
                <div className="flex items-center text-destructive">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Unable to Delete Account
                </div>
              ) : (
                "Are you sure you want to delete your account?"
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteError ? (
                <div className="text-destructive">{deleteError}</div>
              ) : (
                "This action cannot be undone. This will permanently delete your account and remove your data from our servers."
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
                {isDeleting ? "Deleting..." : "Delete Account"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}