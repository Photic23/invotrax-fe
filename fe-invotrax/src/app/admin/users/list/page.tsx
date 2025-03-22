// UsersTable.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/ui/navbar";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit, Eye, PlusCircle } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  company_name: string;
  role: string;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [usernameFilter, setUsernameFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {logout } = useAuth();
  const router = useRouter();

  // Fetch users from the API with authentication token
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Get the authentication token from local storage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized: Please login again');
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users data';
        setError(errorMessage);
        setLoading(false);
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on username and role
  // Filter users based on username and role
  useEffect(() => {
    let result = users;
    
    if (usernameFilter) {
      result = result.filter(user => 
        user.username.toLowerCase().includes(usernameFilter.toLowerCase())
      );
    }
    
    if (roleFilter && roleFilter !== "all") {
      result = result.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(result);
  }, [users, usernameFilter, roleFilter]);

  // Get unique roles for the filter dropdown
  const uniqueRoles = [...new Set(users.map(user => user.role))];

  // Handle view user detail
  const handleViewUserDetail = (userId: number) => {
    router.push(`../users/detail/${userId}`);
  };

    // Handle view user detail
    const handleViewUserUpdate = (userId: number) => {
        router.push(`../users/update/${userId}`);
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
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Users Management</CardTitle>
                <CardDescription>
                Manage and filter users across the platform
                </CardDescription>
            </div>
            <Button onClick={() => router.push('./add')}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add User
            </Button>
            </CardHeader>
            <CardContent>
            <div className="flex flex-col gap-4 mb-6 md:flex-row">
                <div className="flex-1 space-y-2">
                <Label htmlFor="username-filter">Filter by Username</Label>
                <Input
                    id="username-filter"
                    placeholder="Search username..."
                    value={usernameFilter}
                    onChange={(e) => setUsernameFilter(e.target.value)}
                />
                </div>
                <div className="flex-1 space-y-2">
                <Label htmlFor="role-filter">Filter by Role</Label>
                <Select
                    value={roleFilter}
                    onValueChange={setRoleFilter}
                >
                    <SelectTrigger id="role-filter">
                    <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {uniqueRoles.map(role => (
                        <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-6">Loading users data...</div>
            ) : error ? (
                <div className="text-center py-6 text-red-500">{error}</div>
            ) : (
                <Table>
                <TableCaption>
                    Total of {filteredUsers.length} users {roleFilter !== "all" && `with role: ${roleFilter}`}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">
                        No users found matching the filters
                        </TableCell>
                    </TableRow>
                    ) : (
                    filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.company_name}</TableCell>
                        <TableCell>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin" ? "bg-purple-100 text-purple-800" :
                            user.role === "vendor" ? "bg-blue-100 text-blue-800" :
                            user.role === "staff" ? "bg-green-100 text-green-800" :
                            "bg-gray-100 text-gray-800"
                            }`}>
                            {user.role}
                            </span>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewUserDetail(user.id)}
                            >
                            <Eye className="w-4 h-4 mr-1" /> 
                            View
                            </Button>
                            <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewUserUpdate(user.id)}
                            >
                            <Edit className="w-4 h-4 mr-1" /> 
                            Update
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))
                    )}
                </TableBody>
                </Table>
            )}
            </CardContent>
        </Card>
        </div>
    </div>
  );
}