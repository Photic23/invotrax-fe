'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, LockIcon } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/ui/navbar';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  company_name: string;
  role: string;
}

// Form validation schema
const formSchema = z.object({
  phone_number: z.string().min(8, "Phone number must be at least 8 digits"),
  company_name: z.string().min(1, "Company name is required"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal('')),
  password2: z.string().optional().or(z.literal(''))
}).refine((data) => !data.password || data.password === data.password2, {
  message: "Passwords do not match",
  path: ["password2"]
});

export default function UpdateProfilePage() {
  const { getToken, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number: "",
      company_name: "",
      password: "",
      password2: ""
    }
  });

  // Fetch user profile data to pre-fill the form
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isLoggedIn) {
        router.push('/login');
        return;
      }
      
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
        
        // Pre-fill form with existing data (only editable fields)
        form.reset({
          phone_number: data.phone_number,
          company_name: data.company_name,
          password: "",
          password2: ""
        });
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError('Failed to load user profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [isLoggedIn, getToken, form, router]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = getToken();
      if (!token) {
        setError('No authentication token found');
        return;
      }
      
      // Prepare the data to send
      const formData = {
        phone_number: values.phone_number,
        company_name: values.company_name,
      };
      
      // Only include passwords if they were provided
      if (values.password && values.password.length > 0) {
        Object.assign(formData, {
          password: values.password,
          password2: values.password2
        });
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }
      
      setSuccess('Profile updated successfully!');
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/user/detail');
      }, 1500);
      
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
                >
                Logout
                </Link>
            </div>
            </div>
        </header>
    <div className='flex-grow flex items-center justify-center'>  
        <div className="container mx-auto py-8">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                    <CardTitle>Update Profile</CardTitle>
                    <CardDescription>Update your account information</CardDescription>
                    </div>
                    {profile?.role && (
                    <Badge variant="outline" className="capitalize">
                        {profile.role}
                    </Badge>
                    )}
                </div>
                </CardHeader>
                
                <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                
                {success && (
                    <Alert className="mb-4 bg-green-50 border-green-200">
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                    </Alert>
                )}
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Read-only fields */}
                    <div className="space-y-4 mb-6">
                        <div className="border rounded-md p-3 bg-gray-50">
                        <div className="flex justify-between mb-2">
                            <h3 className="text-sm font-medium">Account Information</h3>
                            <div className="flex items-center text-xs text-muted-foreground">
                            <LockIcon className="h-3 w-3 mr-1" /> Read-only
                            </div>
                        </div>
                        
                        <div className="grid gap-2">
                            
                            <div className="grid grid-cols-3 gap-1">
                            <p className="text-sm font-medium">Username</p>
                            <p className="text-sm col-span-2">{profile?.username}</p>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-1">
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm col-span-2">{profile?.email}</p>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-1">
                            <p className="text-sm font-medium">Role</p>
                            <p className="text-sm col-span-2 capitalize">{profile?.role}</p>
                            </div>
                        </div>
                        </div>
                    </div>
                    
                    {/* Editable fields */}
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium mb-4">Editable Information</h3>
                        
                        <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        
                        <FormField
                        control={form.control}
                        name="company_name"
                        render={({ field }) => (
                            <FormItem className="mt-4">
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter company name" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    
                    {/* Password change section */}
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium mb-4">Change Password (Optional)</h3>
                        
                        <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Leave blank to keep current password" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        
                        <FormField
                        control={form.control}
                        name="password2"
                        render={({ field }) => (
                            <FormItem className="mt-4">
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Confirm new password" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    
                    <CardFooter className="flex justify-between px-0 pt-6">
                        <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => router.push('/user/detail')}
                        >
                        Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                        </Button>
                    </CardFooter>
                    </form>
                </Form>
                </CardContent>
            </Card>
            </div>
        </div>
    </div> 
  );
}