"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, Package, User, Building, Star, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '@/components/ui/navbar';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

// Type definitions
interface KategoriProdukDetail {
  id: number;
  nama: string;
}

interface SupplierVendorDetail {
  id: number;
  company_name: string;
  email?: string;
  phone_number?: string;
}

interface PengajuanDetail {
  id: number;
  status_garansi: string;
  kategori_produk_detail: KategoriProdukDetail;
  supplier_vendor_detail: SupplierVendorDetail;
  tanggal_estimasi: string | null;
  tanggal_diterima_dikirim: string | null;
  nama_produk: string;
  jumlah_produk: number;
  deskripsi_produk: string;
  url_foto_produk: string;
  status: 'diajukan' | 'diproses' | 'ditolak' | 'dikirim' | 'diterima';
  created_at: string;
  harga_diajukan: string;
  tanggal_garansi: string | null;
  is_deleted: boolean;
  created_by: number;
}

const DashboardDetail: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();
  
  const [pengajuan, setPengajuan] = useState<PengajuanDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const pengajuanId = params.id as string;

  // Try to get data from URL params first
  useEffect(() => {
    try {
      // Check if data was passed via URL parameters
      const encodedData = searchParams.get('data');
      if (encodedData) {
        const decodedData = JSON.parse(decodeURIComponent(encodedData));
        setPengajuan(decodedData);
        setLoading(false);
        return;
      }

      // Check if data was passed via sessionStorage (fallback)
      const sessionData = sessionStorage.getItem(`pengajuan_${pengajuanId}`);
      if (sessionData) {
        const parsedData = JSON.parse(sessionData);
        setPengajuan(parsedData);
        setLoading(false);
        // Clean up session storage after use
        sessionStorage.removeItem(`pengajuan_${pengajuanId}`);
        return;
      }

      // If no cached data, fetch from API as fallback
      fetchPengajuanDetail();
    } catch (err) {
      console.error('Error parsing cached data:', err);
      fetchPengajuanDetail();
    }
  }, [pengajuanId, searchParams]);

  // API call function with authentication (fallback)
  const apiCall = async <T,>(url: string): Promise<T> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication token not found. Please login first.');
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Pengajuan not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Fetch pengajuan detail (fallback when no cached data)
  const fetchPengajuanDetail = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiCall<PengajuanDetail>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan/pengajuan_penawaran_pengadaan/${pengajuanId}/`
      );

      setPengajuan(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching pengajuan detail:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'diajukan':
        return {
          color: 'text-blue-600 bg-blue-100',
          icon: <Clock className="w-4 h-4" />,
          text: 'Diajukan'
        };
      case 'diproses':
        return {
          color: 'text-yellow-600 bg-yellow-100',
          icon: <Package className="w-4 h-4" />,
          text: 'Diproses'
        };
      case 'dikirim':
        return {
          color: 'text-purple-600 bg-purple-100',
          icon: <Truck className="w-4 h-4" />,
          text: 'Dikirim'
        };
      case 'diterima':
        return {
          color: 'text-green-600 bg-green-100',
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Diterima'
        };
      case 'ditolak':
        return {
          color: 'text-red-600 bg-red-100',
          icon: <XCircle className="w-4 h-4" />,
          text: 'Ditolak'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-100',
          icon: <Clock className="w-4 h-4" />,
          text: status
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pengajuan detail...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Detail</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-2">
            <button 
              onClick={fetchPengajuanDetail}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
            <button 
              onClick={() => router.back()}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!pengajuan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Pengajuan not found</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(pengajuan.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <ProtectedRoute requiredRole={["manager", "owner"]}>
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-bold text-xl">
                InvoTrax
              </Link>
              <Navbar />
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
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

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Pengajuan Detail</h1>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusDisplay.color}`}>
                {statusDisplay.icon}
                <span className="font-medium">{statusDisplay.text}</span>
              </div>
            </div>
            <p className="text-gray-600">ID: {pengajuan.id}</p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Product Details */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Produk</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nama Produk</label>
                    <p className="text-gray-900 font-medium">{pengajuan.nama_produk}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Kategori Produk</label>
                    <p className="text-gray-900">{pengajuan.kategori_produk_detail.nama}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Kuantitas</label>
                    <p className="text-gray-900">{pengajuan.jumlah_produk.toLocaleString('id-ID')} units</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Harga diajukan</label>
                    <p className="text-green-600 font-bold text-lg">{formatCurrency(pengajuan.harga_diajukan)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Deskripsi</label>
                  <p className="text-gray-900 mt-1">{pengajuan.deskripsi_produk}</p>
                </div>
              </div>

              {/* Supplier Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Supplier</h2>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{pengajuan.supplier_vendor_detail.company_name}</h3>
                    <p className="text-gray-600">Supplier ID: {pengajuan.supplier_vendor_detail.id}</p>
                    {pengajuan.supplier_vendor_detail.email && (
                      <p className="text-gray-600">{pengajuan.supplier_vendor_detail.email}</p>
                    )}
                    {pengajuan.supplier_vendor_detail.phone_number && (
                      <p className="text-gray-600">{pengajuan.supplier_vendor_detail.phone_number}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Detail Waktu</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Waktu dibuat</p>
                      <p className="text-gray-900">{formatDate(pengajuan.created_at)}</p>
                    </div>
                  </div>
                  {pengajuan.tanggal_estimasi && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Estimasi diterima</p>
                        <p className="text-gray-900">{formatDate(pengajuan.tanggal_estimasi)}</p>
                      </div>
                    </div>
                  )}
                  {pengajuan.tanggal_diterima_dikirim && (
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tanggal diterima</p>
                        <p className="text-gray-900">{formatDate(pengajuan.tanggal_diterima_dikirim)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Warranty Information */}
              {(pengajuan.status_garansi || pengajuan.tanggal_garansi) && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Garansi</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pengajuan.status_garansi && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status Garansi</label>
                        <p className="text-gray-900">{pengajuan.status_garansi}</p>
                      </div>
                    )}
                    {pengajuan.tanggal_garansi && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Ekspirasi Garansi</label>
                        <p className="text-gray-900">{formatDate(pengajuan.tanggal_garansi)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </div>
  );
};

export default DashboardDetail;