'use client';

import React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/ui/navbar";

export default function HomePage() {
  const { user, logout } = useAuth();
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
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-bold mb-6">Welcome, {user?.name}!</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your role is {user?.role}!
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

function MainNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Features</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <ListItem href="/features/analytics" title="Analytics">
                Track your application performance and user engagement.
              </ListItem>
              <ListItem href="/features/automation" title="Automation">
                Automate repetitive tasks and workflows.
              </ListItem>
              <ListItem href="/features/reporting" title="Reporting">
                Generate detailed reports and insights.
              </ListItem>
              <ListItem href="/features/integration" title="Integration">
                Connect with other tools and services.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <ListItem href="/resources/documentation" title="Documentation">
                Learn how to use our platform effectively.
              </ListItem>
              <ListItem href="/resources/blog" title="Blog">
                Read the latest news and updates.
              </ListItem>
              <ListItem href="/resources/support" title="Support">
                Get help with any issues or questions.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/profile" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              About
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
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