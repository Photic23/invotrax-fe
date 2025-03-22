// app/components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Note: using 'next/navigation' not 'next/router'
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

export default function ProtectedRoute({ 
    children, 
    requiredRole = null 
  }: { 
    children: ReactNode;
    requiredRole?: string | null;
  }) {
    const { isLoggedIn, user, isLoading } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
      // Only redirect after loading is complete
      if (!isLoading) {
        if (!isLoggedIn) {
          router.push('/login');
        } else if (requiredRole && user?.role !== requiredRole) {
          router.push('/unauthorized');
        }
      }
    }, [isLoggedIn, user, router, requiredRole, isLoading]);
  
    // Show loading state while checking authentication
    if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
  
    if (!isLoggedIn) {
      return null;
    }
  
    if (requiredRole && user?.role !== requiredRole) {
      return null;
    }
  
    return <>{children}</>;
  }