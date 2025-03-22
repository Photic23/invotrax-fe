// components/AuthCheck.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation'; // Note: using 'next/navigation' not 'next/router'
import { ReactNode } from 'react';

export default function AuthCheck({ children }: { children: ReactNode }) {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  
  if (!isLoggedIn) {
    router.push('/login');
  }
  
  return <>{children}</>;
}