'use client';

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/ui/navbar";

// Define types for better TypeScript support
type UserRole = 'admin' | 'staff' | 'customer' | 'vendor' | 'manager' | 'owner';

type RoleRedirectMap = {
  [K in UserRole]: string;
};

export default function HomePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  // Role-based redirection with proper TypeScript typing
  useEffect(() => {
    if (!isLoading && user) {
      const roleRedirects: RoleRedirectMap = {
        'admin': '/admin/users/list',
        'staff': '/pengajuan_penawaran_pengadaan',
        'customer': '/pengajuan_penawaran_pengadaan',
        'vendor': '/penawaran-pengadaan',
        'manager': '/kontrak',
        'owner': '/dashboard'
      };

      const userRole = user.role.toLowerCase() as UserRole;
      const redirectPath = roleRedirects[userRole];
      
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        console.warn(`Unknown role: ${user.role}. No redirect configured.`);
      }
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // This component will only briefly show before redirect
  // You might want to show a loading state or redirect message
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        {/* Navbar */}
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

        {/* Main Content - Shows briefly before redirect */}
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-4">Welcome, {user?.name}!</h1>
            <p className="text-lg text-muted-foreground">
              Redirecting you to your dashboard...
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} PT Karya Bersama Pinto. All rights reserved.
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string;
  }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";