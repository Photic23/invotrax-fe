'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

export default function ProtectedRoute({ 
  children, 
  requiredRole = null 
}: { 
  children: ReactNode;
  requiredRole?: string | string[] | null; // Allow single or multiple roles
}) {
  const { isLoggedIn, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push('/login');
      } else if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]; // Ensure array
        if (user?.role && !allowedRoles.includes(user.role)) {
          router.push('/unauthorized');
        }
      }
    }
  }, [isLoggedIn, user, router, requiredRole, isLoading]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isLoggedIn || (requiredRole && user?.role && !Array.isArray(requiredRole) && user.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
