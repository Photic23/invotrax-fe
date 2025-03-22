'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Navbar from '@/components/ui/navbar';

export default function UserRegistrationForm() {
  const router = useRouter();
  const {logout} = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password2: '',
    phone_number: '',
    company_name: '',
    role: 'customer' as 'customer' | 'admin' | 'staff' | ' manager' | 'vendor'
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value as 'customer' | 'admin' | 'staff' | ' manager' | 'vendor'
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login first.');
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to register user');
      }
      
      // Handle success
      setSuccess(true);
      console.log('User created successfully:', data);
      
      // Reset form after successful submission
      setFormData({
        email: '',
        username: '',
        password: '',
        password2: '',
        phone_number: '',
        company_name: '',
        role: 'customer'
      });
      
      // Optionally redirect to users list or dashboard
      // setTimeout(() => router.push('/users'), 2000);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Register New User</CardTitle>
        <CardDescription>Create a new user account with admin privileges</CardDescription>
      </CardHeader>
      
      <CardContent>
        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              User registered successfully!
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password2">Confirm Password</Label>
              <Input
                id="password2"
                type="password"
                name="password2"
                value={formData.password2}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={handleSelectChange}
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
            
            <Button 
              type="submit" 
              className="mt-2" 
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register User'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </div>
    </div>
  );
}