'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Navbar from '@/components/ui/navbar';

interface UserData {
  id: number;
  email: string;
  username: string;
  phone_number: string;
  company_name: string;
  role: string;
}

export default function UserRoleUpdate() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [role, setRole] = useState<string>('');
  const {logout } = useAuth();

  // Fetch user data when component mounts
  useEffect(() => {
    if (!id) return;
    
    const fetchUser = async () => {
      setIsFetching(true);
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found. Please login first.');
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/users/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUserData(data);
        setRole(data.role);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An error occurred while fetching user data');
        }
        console.error('Error fetching user:', err);
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchUser();
  }, [id]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login first.');
      }
      
      if (!userData) {
        throw new Error('User data not available');
      }
      
      // Prepare update data - only sending role
      const updateData = {
        email: userData.email,
        username: userData.username,
        phone_number: userData.phone_number,
        company_name: userData.company_name,
        role: role
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/users/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update user');
      }
      
      // Update successful
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/users/list');
      }, 2000);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error('Update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="ml-2">Loading user data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userData && !isFetching) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error || "Could not load user data. Please try again."}
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => router.push('/users')}>
                Back to Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col ">
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
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
                >
                Logout
                </Link>
            </div>
            </div>
        </header>
    <div className="flex-grow flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Update User Role</CardTitle>
          <CardDescription>
            Change role for user: {userData?.username}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                User role updated successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert className="mb-4 bg-red-50 text-red-800 border-red-200" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="p-2 border rounded-md bg-gray-50 text-gray-500">
                {userData?.email}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="p-2 border rounded-md bg-gray-50 text-gray-500">
                {userData?.username}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <div className="p-2 border rounded-md bg-gray-50 text-gray-500">
                {userData?.phone_number}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <div className="p-2 border rounded-md bg-gray-50 text-gray-500">
                {userData?.company_name}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={role} 
                onValueChange={setRole}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/users')}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || role === userData?.role}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Update Role'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
</div>
  );
}