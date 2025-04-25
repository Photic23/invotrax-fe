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

// Define the Exchange interface
interface Exchange {
  kode: string;
  nama: string;
  owner: string;
  status: number; // 0: diajukan, 1: diproses, 2: ditolak, 3: disetujui, 4: selesai
  tanggal: string; // date in dd/mm/yyyy format
}

// Dummy exchange data
const DUMMY_EXCHANGES: Exchange[] = [
  {
    kode: "EX001",
    nama: "Pertukaran Barang A",
    owner: "PT Supplier Utama",
    status: 0, // diajukan
    tanggal: "25/04/2025"
  },
  {
    kode: "EX002",
    nama: "Pengadaan Material B",
    owner: "CV Mitra Sejati",
    status: 1, // diproses
    tanggal: "23/04/2025"
  },
  {
    kode: "EX003",
    nama: "Pembaruan Sistem C",
    owner: "PT Teknologi Maju",
    status: 2, // ditolak
    tanggal: "20/04/2025"
  },
  {
    kode: "EX004",
    nama: "Kontrak Layanan D",
    owner: "PT Solusi Bisnis",
    status: 3, // disetujui
    tanggal: "18/04/2025"
  },
  {
    kode: "EX005",
    nama: "Proyek Ekspansi E",
    owner: "PT Konstruksi Handal",
    status: 4, // selesai
    tanggal: "15/04/2025"
  },
  {
    kode: "EX006",
    nama: "Pengadaan Peralatan F",
    owner: "CV Pemasok Terpercaya",
    status: 0, // diajukan
    tanggal: "12/04/2025"
  }
];

// User interface is no longer needed as we're using Exchange
interface Exchange {
  kode: string;
  nama: string;
  owner: string;
  status: number; // 0: diajukan, 1: diproses, 2: ditolak, 3: disetujui, 4: selesai
  tanggal: string; // date in dd/mm/yyyy format
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

  // Load dummy data instead of fetching from API
  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      try {
        setExchanges(DUMMY_EXCHANGES);
        setFilteredExchanges(DUMMY_EXCHANGES);
        setLoading(false);
      } catch (err) {
        setError("Failed to load dummy data");
        setLoading(false);
      }
    }, 800); // Simulate a small loading delay

    return () => clearTimeout(timer);
  }, []);

  // Filter exchanges based on nama and status
  useEffect(() => {
    let result = exchanges;
    
    if (namaFilter) {
      result = result.filter(exchange => 
        exchange.nama.toLowerCase().includes(namaFilter.toLowerCase())
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
  const handleViewExchangeDetail = (kode: string) => {
    // Since there's no backend, we'll just alert for now
    // In production, this would navigate to the detail page
    alert(`View exchange details for kode: ${kode}`);
    // When backend is ready, uncomment this:
    // router.push(`../exchanges/detail/${kode}`);
  };

  // Handle view exchange update
  const handleUpdateExchange = (kode: string) => {
    // Since there's no backend, we'll just alert for now
    alert(`Update exchange with kode: ${kode}`);
    // When backend is ready, uncomment this:
    // router.push(`../exchanges/update/${kode}`);
  };

  // Handle add exchange
  const handleAddExchange = () => {
    // Since there's no backend, we'll just alert for now
    alert("Add new exchange functionality");
    // When backend is ready, uncomment this:
    // router.push('./add');
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
                <Label htmlFor="nama-filter">Filter by Name</Label>
                <Input
                    id="nama-filter"
                    placeholder="Search exchange name..."
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
                <div className="text-center py-6">Loading users data...</div>
            ) : error ? (
                <div className="text-center py-6 text-red-500">{error}</div>
            ) : (
                <Table>
                <TableCaption>
                    Total of {filteredExchanges.length} exchanges {statusFilter !== "all" && `with status: ${getStatusText(parseInt(statusFilter))}`}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredExchanges.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center">
                        No exchanges found matching the filters
                        </TableCell>
                    </TableRow>
                    ) : (
                    filteredExchanges.map((exchange) => (
                        <TableRow key={exchange.kode}>
                        <TableCell className="font-medium">{exchange.kode}</TableCell>
                        <TableCell>{exchange.nama}</TableCell>
                        <TableCell>{exchange.owner}</TableCell>
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
                            onClick={() => handleViewExchangeDetail(exchange.kode)}
                            className="mr-2"
                            >
                            <Eye className="w-4 h-4 mr-1" /> 
                            View
                            </Button>
                            <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleUpdateExchange(exchange.kode)}
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