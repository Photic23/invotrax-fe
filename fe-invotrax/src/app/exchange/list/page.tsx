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

// Define the Exchange interface
interface Exchange {
  id: number;
  nama_produk: string;
  jumlah_produk: number;
  deskripsi_produk?: string;
  alasan_penukaran: string;
  status: number; // 0: diajukan, 1: diproses, 2: ditolak, 3: disetujui, 4: selesai
  tanggal: string; // date in dd/mm/yyyy format from created_at
  created_by: number; // From API - user ID
  created_by_username: string; // Username of the creator
  is_deleted?: boolean;
}

export default function ExchangesTable() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [filteredExchanges, setFilteredExchanges] = useState<Exchange[]>([]);
  const [namaFilter, setNamaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const router = useRouter();

  // Fetch exchanges from API
  const fetchExchanges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/exchange-requests/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Transform API data to match our Exchange interface
      // Map the response data to our Exchange interface
      const apiExchanges = response.data.map((item: any) => {
        // Try to get username - it might be nested differently depending on serializer
        let username = "Unknown";
        if (typeof item.created_by === 'object' && item.created_by) {
          username = item.created_by.username || "Unknown";
        } else if (item.created_by_username) {
          username = item.created_by_username;
        } else if (item.created_by_detail && item.created_by_detail.username) {
          username = item.created_by_detail.username;
        }
        
        return {
          id: item.id,
          nama_produk: item.nama_produk || "",
          jumlah_produk: item.jumlah_produk || 0,
          deskripsi_produk: item.deskripsi_produk || "",
          alasan_penukaran: item.alasan_penukaran || "",
          status: item.status || 0,
          tanggal: formatDate(item.created_at || new Date()),
          created_by: typeof item.created_by === 'object' ? item.created_by?.id : item.created_by,
          created_by_username: username,
          is_deleted: item.is_deleted
        };
      });
      
      setExchanges(apiExchanges);
      setFilteredExchanges(apiExchanges);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching exchanges:", err);
      setError(err.message || "Failed to load exchanges");
      setLoading(false);
    }
  };

  // Format date from API to dd/mm/yyyy
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Load data when component mounts
  useEffect(() => {
    fetchExchanges();
  }, []);

  // Filter exchanges based on nama and status
  useEffect(() => {
    let result = exchanges;
    
    if (namaFilter) {
      result = result.filter(exchange => 
        exchange.nama_produk.toLowerCase().includes(namaFilter.toLowerCase())
      );
    }
    
    if (statusFilter && statusFilter !== "all") {
      result = result.filter(exchange => exchange.status === parseInt(statusFilter));
    }
    
    setFilteredExchanges(result);
  }, [exchanges, namaFilter, statusFilter]);

  // Define status options
  const statusOptions = [
    { value: 0, label: "Diajukan" },
    { value: 1, label: "Diproses" },
    { value: 2, label: "Ditolak" },
    { value: 3, label: "Disetujui" },
    { value: 4, label: "Selesai" }
  ];

  // Handle view exchange detail
  const handleViewExchangeDetail = (id: number) => {
    router.push(`../exchanges/detail/${id}`);
  };

  // Handle view exchange update
  const handleUpdateExchange = (id: number) => {
    router.push(`../exchanges/update/${id}`);
  };

  // Handle add exchange
  const handleAddExchange = () => {
    router.push('./add');
  };
  
  // Get status text from status code
  const getStatusText = (status: number) => {
    switch(status) {
      case 0: return "Diajukan";
      case 1: return "Diproses";
      case 2: return "Ditolak";
      case 3: return "Disetujui";
      case 4: return "Selesai";
      default: return "Unknown";
    }
  };
  
  // Get status color class based on status
  const getStatusColorClass = (status: number) => {
    switch(status) {
      case 0: return "bg-blue-100 text-blue-800"; // Diajukan
      case 1: return "bg-yellow-100 text-yellow-800"; // Diproses
      case 2: return "bg-red-100 text-red-800"; // Ditolak
      case 3: return "bg-green-100 text-green-800"; // Disetujui
      case 4: return "bg-purple-100 text-purple-800"; // Selesai
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
                <CardTitle>Exchanges Management</CardTitle>
                <CardDescription>
                Manage and filter exchanges across the platform
                </CardDescription>
            </div>
            <Button onClick={handleAddExchange}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Exchange
            </Button>
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
                        <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-6">Loading exchanges data...</div>
            ) : error ? (
                <div className="text-center py-6 text-red-500">{error}</div>
            ) : (
                <Table>
                <TableCaption>
                    Total of {filteredExchanges.length} exchanges {statusFilter !== "all" && `with status: ${getStatusText(parseInt(statusFilter))}`}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredExchanges.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center">
                        No exchanges found matching the filters
                        </TableCell>
                    </TableRow>
                    ) : (
                    filteredExchanges.map((exchange) => (
                        <TableRow key={exchange.id}>
                        <TableCell className="font-medium">{exchange.id}</TableCell>
                        <TableCell>{exchange.nama_produk}</TableCell>
                        <TableCell>{exchange.jumlah_produk}</TableCell>
                        <TableCell>{exchange.created_by_username}</TableCell>
                        <TableCell>{exchange.tanggal}</TableCell>
                        <TableCell>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(exchange.status)}`}>
                            {getStatusText(exchange.status)}
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