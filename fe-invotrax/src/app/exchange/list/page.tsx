// ExchangesTable.tsx
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
import axios from "axios";

// Define the Exchange interface based on actual API response
interface Exchange {
  id: number;
  pengajuan_detail: {
    id: number;
    nama_produk: string;
    jumlah_produk: number;
    deskripsi_produk: string;
    status: string;
  } | null;
  alasan_penukaran: string;
  url_foto_penukaran: string;
  status: string; // String based status (diajukan, diproses, etc.)
  created_at: string;
  is_deleted: boolean;
  created_by: number;
  created_by_username: string;
  pengajuan: number | null;
  tanggal: string; // Formatted date for display
}

// Define User interface
interface User {
  id: number;
  name: string;
  role: string;
}

// Define API response interface
interface ApiExchangeResponse {
  id: number;
  pengajuan_detail: {
    id: number;
    nama_produk: string;
    jumlah_produk: number;
    deskripsi_produk: string;
    status: string;
    [key: string]: any;
  } | null;
  alasan_penukaran: string;
  url_foto_penukaran: string;
  status: string;
  created_at: string;
  is_deleted: boolean;
  created_by: number;
  created_by_username: string;
  pengajuan: number | null;
  [key: string]: any;
}

export default function ExchangesTable() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [filteredExchanges, setFilteredExchanges] = useState<Exchange[]>([]);
  const [namaFilter, setNamaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [requesterFilter, setRequesterFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Fetch exchanges from API
  const fetchExchanges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<ApiExchangeResponse[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/layanan_pasca_beli/exchange-request/`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Transform API data to match our Exchange interface
      const apiExchanges: Exchange[] = response.data.map((item: ApiExchangeResponse) => {
        return {
          id: item.id,
          pengajuan_detail: item.pengajuan_detail,
          alasan_penukaran: item.alasan_penukaran,
          url_foto_penukaran: item.url_foto_penukaran,
          status: item.status,
          created_at: item.created_at,
          is_deleted: item.is_deleted,
          created_by: item.created_by,
          created_by_username: item.created_by_username || "Unknown",
          pengajuan: item.pengajuan,
          tanggal: formatDate(item.created_at)
        };
      });
      
      // Filter by user role - if customer, only show their own requests
      let filteredByRole = apiExchanges;
      if (user?.role === 'customer') {
        filteredByRole = apiExchanges.filter((exchange: Exchange) => 
          exchange.created_by_username === user.name || 
          exchange.created_by === user.id
        );
      }
      
      setExchanges(filteredByRole);
      setFilteredExchanges(filteredByRole);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching exchanges:", err);
      setError(err.message || "Failed to load exchanges");
      setLoading(false);
    }
  };

  // Format date from API to dd/mm/yyyy
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Load data when component mounts
  useEffect(() => {
    fetchExchanges();
  }, [user]);

  // Filter exchanges based on nama, status, and requester
  useEffect(() => {
    let result = exchanges;
    
    if (namaFilter) {
      result = result.filter((exchange: Exchange) => 
        exchange.pengajuan_detail?.nama_produk?.toLowerCase().includes(namaFilter.toLowerCase())
      );
    }
    
    if (statusFilter && statusFilter !== "all") {
      result = result.filter((exchange: Exchange) => exchange.status === statusFilter);
    }
    
    if (requesterFilter) {
      result = result.filter((exchange: Exchange) => 
        exchange.created_by_username?.toLowerCase().includes(requesterFilter.toLowerCase())
      );
    }
    
    setFilteredExchanges(result);
  }, [exchanges, namaFilter, statusFilter, requesterFilter]);

  // Define status options for filtering - using string values now
  const statusOptions = [
    { value: "diajukan", label: "Diajukan" },
    { value: "diproses", label: "Diproses" },
    { value: "ditolak", label: "Ditolak" },
    { value: "dikirim", label: "Dikirim" },
    { value: "diterima", label: "Diterima" }
  ];

  // Handle view exchange detail
  const handleViewExchangeDetail = (id: number): void => {
    router.push(`../exchange/${id}`);
  };

  // Handle view exchange update
  const handleUpdateExchange = (id: number): void => {
    router.push(`../exchange/${id}/update`);
  };


  // Get status color class based on status string
  const getStatusColorClass = (status: string): string => {
    switch(status) {
      case "diajukan": return "bg-blue-100 text-blue-800"; 
      case "diproses": return "bg-yellow-100 text-yellow-800"; 
      case "ditolak": return "bg-red-100 text-red-800"; 
      case "dikirim": return "bg-purple-100 text-purple-800"; 
      case "diterima": return "bg-green-100 text-green-800"; 
      default: return "bg-gray-100 text-gray-800";
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
                  <span className="text-sm font-medium">
                    {user?.name} ({user?.role})
                  </span>
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
        <div className='flex-grow flex items-center justify-center'>
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Exchanges Management</CardTitle>
                <CardDescription>
                {user?.role === 'customer' 
                  ? 'View and manage your exchange requests' 
                  : 'Manage and filter exchanges across the platform'}
                </CardDescription>
            </div>
            </CardHeader>
            <CardContent>
            <div className="flex flex-col gap-4 mb-6 md:flex-row">
                <div className="flex-1 space-y-2">
                <Label htmlFor="nama-filter">Filter by Product Name</Label>
                <Input
                    id="nama-filter"
                    placeholder="Search product name..."
                    value={namaFilter}
                    onChange={(e) => setNamaFilter(e.target.value)}
                />
                </div>
                <div className="flex-1 space-y-2">
                <Label htmlFor="status-filter">Filter by Status</Label>
                <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                >
                    <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                        {option.label}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
                {/* Only show requester filter for staff/admin roles */}
                {user?.role !== 'customer' && (
                  <div className="flex-1 space-y-2">
                  <Label htmlFor="requester-filter">Filter by Requester</Label>
                  <Input
                      id="requester-filter"
                      placeholder="Search requester..."
                      value={requesterFilter}
                      onChange={(e) => setRequesterFilter(e.target.value)}
                  />
                  </div>
                )}
            </div>

            {loading ? (
                <div className="text-center py-6">Loading exchanges data...</div>
            ) : error ? (
                <div className="text-center py-6 text-red-500">{error}</div>
            ) : (
                <Table>
                <TableCaption>
                    {user?.role === 'customer' 
                      ? `Your exchange requests: ${filteredExchanges.length} total` 
                      : `Total of ${filteredExchanges.length} exchanges found`}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Jumlah</TableHead>
                    {user?.role !== 'customer' && <TableHead>Requester</TableHead>}
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredExchanges.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={user?.role !== 'customer' ? 7 : 6} className="text-center">
                        No exchanges found matching the filters
                        </TableCell>
                    </TableRow>
                    ) : (
                    filteredExchanges.map((exchange: Exchange) => (
                        <TableRow key={exchange.id}>
                        <TableCell className="font-medium">{exchange.id}</TableCell>
                        <TableCell>{exchange.pengajuan_detail?.nama_produk || "No product data"}</TableCell>
                        <TableCell>{exchange.pengajuan_detail?.jumlah_produk || 0}</TableCell>
                        {user?.role !== 'customer' && <TableCell>{exchange.created_by_username}</TableCell>}
                        <TableCell>{exchange.tanggal}</TableCell>
                        <TableCell>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(exchange.status)}`}>
                            {exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)}
                            </span>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewExchangeDetail(exchange.id)}
                            className="mr-2"
                            >
                            <Eye className="w-4 h-4 mr-1" /> 
                            View
                            </Button>
                            <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleUpdateExchange(exchange.id)}
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