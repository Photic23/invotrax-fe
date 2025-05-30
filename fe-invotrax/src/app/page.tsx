'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from "next/image";

export default function Home() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while still loading authentication state
    if (isLoading) return;

    // Redirect based on authentication status
    if (isLoggedIn) {
      router.push('/home');
    } else {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  // Show loading spinner while checking authentication or redirecting
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show nothing while redirecting (this will be very brief)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}