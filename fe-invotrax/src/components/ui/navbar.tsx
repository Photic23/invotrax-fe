'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();

  // Define menu items based on role
  const getFeatureItems = () => {
    // Common features for all authenticated users
    const commonFeatures = [
      {
        title: "Dashboard",
        href: "/dashboard",
        description: "View your personalized dashboard."
      }
    ];

    // Role-specific features
    switch(user?.role) {
        case 'admin':
            return [
            ...commonFeatures,
            {
                title: "User Management",
                href: "/admin/users/list",
                description: "Manage all users and permissions."
            },
            {
                title: "Add User",
                href: "/admin/users/add",
                description: "Add new user."
            },
            ];
        case 'staff':
            return [
            ...commonFeatures,
            {
                title: "Produk",
                href: "/produk",
                description: "Manage Products, Stocks, and Categories."
            },{
                title: "Customer Management",
                href: "/staff/customers",
                description: "View and manage customer accounts."
            },
            {
                title: "Support Tickets",
                href: "/staff/tickets",
                description: "Handle customer support requests."
            },
            {
                title: "Daftar Request Pengadaan",
                href: "/pengajuan_penawaran_pengadaan",
                description: "Lihat Daftar Request Pengadaan."
            }
            ];
        case 'customer':
            return [
            ...commonFeatures,
            {
                title: "My Profile",
                href: "/customer/profile",
                description: "View and update your account information."
            },
            {
                title: "My Orders",
                href: "/customer/orders",
                description: "Track your orders and purchase history."
            },
            {
                title: "Support",
                href: "/customer/support",
                description: "Get help and submit support tickets."
            }
            ];
        case 'vendor': //atau supplier
            return [
            ...commonFeatures,
            {
                title: "Penawaran Pengadaan",
                href: "/penawaran-pengadaan",
                description: "Manage Procurement to Supplier."
            },
            ];
        case 'manager':
            return [
              ...commonFeatures,
              {
                title: "My Profile",
                href: "/customer/profile",
                description: "View and update your account information."
              },
              {
                title: "My Orders",
                href: "/customer/orders",
                description: "Track your orders and purchase history."
              },
              {
                title: "Support",
                href: "/customer/support",
                description: "Get help and submit support tickets."
              }
            ];
      default:
        // For unauthenticated users or unknown roles
        return [
          {
            title: "Features",
            href: "/features",
            description: "Explore our platform features."
          },
          {
            title: "Analytics",
            href: "/features/analytics",
            description: "Track your application performance and user engagement."
          },
          {
            title: "Automation",
            href: "/features/automation",
            description: "Automate repetitive tasks and workflows."
          },
          {
            title: "Reporting",
            href: "/features/reporting",
            description: "Generate detailed reports and insights."
          }
        ];
    }
  };

  // Define resource items based on role
  const getResourceItems = () => {
    // Common resources for everyone
    const commonResources = [
      {
        title: "Documentation",
        href: "/resources/documentation",
        description: "Learn how to use our platform effectively."
      },
      {
        title: "Blog",
        href: "/resources/blog",
        description: "Read the latest news and updates."
      }
    ];

    // Additional resources based on role
    if (isLoggedIn) {
      switch(user?.role) {
        case 'admin':
          return [
            ...commonResources,
            {
              title: "Admin Guide",
              href: "/resources/admin-guide",
              description: "Comprehensive guide for administrators."
            },
            {
              title: "API Documentation",
              href: "/resources/api",
              description: "Technical documentation for API integration."
            }
          ];
        case 'staff':
          return [
            ...commonResources,
            {
              title: "Staff Training",
              href: "/resources/staff-training",
              description: "Training materials for staff members."
            },
            {
              title: "Support Handbook",
              href: "/resources/support-handbook",
              description: "Guidelines for handling customer inquiries."
            }
          ];
        default:
          return [
            ...commonResources,
            {
              title: "Help Center",
              href: "/resources/help",
              description: "Find answers to common questions."
            },
            {
              title: "Support",
              href: "/resources/support",
              description: "Get help with any issues or questions."
            }
          ];
      }
    }
    
    return commonResources;
  };

  return (
    <div className="flex justify-between items-center p-1">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/home" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Home
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          
          {/* Features menu - content changes based on role */}
          <NavigationMenuItem>
            <NavigationMenuTrigger>Features</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                {getFeatureItems().map((item, index) => (
                  <ListItem key={index} href={item.href} title={item.title}>
                    {item.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          
          {/* Resources menu - content changes based on role
          <NavigationMenuItem>
            <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                {getResourceItems().map((item, index) => (
                  <ListItem key={index} href={item.href} title={item.title}>
                    {item.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem> */}
          
          <NavigationMenuItem>
            <Link href="/user/detail" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Profile
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

    </div>
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