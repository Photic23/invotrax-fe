"use client"

import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Package, RotateCcw, Star, Info } from 'lucide-react';
import Navbar from '@/components/ui/navbar';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

// Type definitions
interface StockData {
  total_stok: number;
  jumlah_produk: number;
}

interface KategoriProdukDetail {
  id: number;
  nama: string;
}

interface SupplierVendorDetail {
  id: number;
  company_name: string;
}

interface PengajuanPenawaranPengadaan {
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
  status: string;
  created_at: string;
  harga_diajukan: string;
  tanggal_garansi: string | null;
  is_deleted: boolean;
  created_by: number;
}

interface ExchangeRequest {
  id: number;
  pengajuan_detail: PengajuanDetail;
  created_by_username: string;
  alasan_penukaran: string;
  url_foto_penukaran: string;
  status: string;
  created_at: string;
  is_deleted: boolean;
  created_by: number;
  pengajuan: number;
}

interface Rating {
  id: number;
  rating: number;
  deskripsi: string;
  created_at: string;
  pengajuan: number;
}

interface DateRange {
  start: string;
  end: string;
}

interface ChartDataPoint {
  month: string;
  amount: number;
}

interface TopOrder {
  name: string;
  company: string;
  amount: number;
}

interface DashboardData {
  inventoryQuantity: number;
  totalProducts: number;
  orderFulfillmentRate: number;
  returnRate: number;
  customerSatisfaction: number;
  chartData: ChartDataPoint[];
  topOrders: TopOrder[];
}

const Dashboard: React.FC = () => {
  // Calculate default date range: 180 days ago to today
  const getDefaultDateRange = (): DateRange => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 180);
    
    return {
      start: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      end: today.toISOString().split('T')[0]
    };
  };

  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  
  const [data, setData] = useState<DashboardData>({
    inventoryQuantity: 0,
    totalProducts: 0,
    orderFulfillmentRate: 0,
    returnRate: 0,
    customerSatisfaction: 0,
    chartData: [],
    topOrders: []
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // API call function with authentication
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Filter data by date range
  const filterByDateRange = <T extends { created_at: string }>(
    items: T[], 
    dateField: keyof T = 'created_at' as keyof T
  ): T[] => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date
    
    return items.filter(item => {
      const itemDate = new Date(item[dateField] as string);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Generate monthly chart data
  const generateChartData = (acceptedOrders: PengajuanPenawaranPengadaan[]): ChartDataPoint[] => {
    const monthlyData: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize all months to 0
    months.forEach(month => {
      monthlyData[month] = 0;
    });

    // Sum up harga_diajukan by month
    acceptedOrders.forEach(order => {
      const date = new Date(order.created_at);
      const month = months[date.getMonth()];
      const amount = parseFloat(order.harga_diajukan || '0');
      monthlyData[month] += amount;
    });

    return months.map(month => ({
      month,
      amount: monthlyData[month]
    }));
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

    const { logout } = useAuth();

  // Fetch all data
  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all required data in parallel
      const [stockData, pengajuanData, exchangeData, ratingData] = await Promise.all([
        apiCall<StockData>(`${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_stok/produk/total_stok/`),
        apiCall<PengajuanPenawaranPengadaan[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan/pengajuan_penawaran_pengadaan/`),
        apiCall<ExchangeRequest[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/layanan_pasca_beli/exchange-request/`),
        apiCall<Rating[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/rating/`)
      ]);

      // Filter data by date range
      const filteredPengajuan = filterByDateRange(pengajuanData);
      const filteredExchange = filterByDateRange(exchangeData);
      const filteredRating = filterByDateRange(ratingData);

      // Calculate accepted orders within date range
      const acceptedOrders = filteredPengajuan.filter(order => order.status === 'diterima');
      
      // Calculate metrics
      const totalOrders = filteredPengajuan.length;
      const orderFulfillmentRate = totalOrders > 0 ? (acceptedOrders.length / totalOrders) * 100 : 0;
      
      const returnRate = acceptedOrders.length > 0 ? (filteredExchange.length / acceptedOrders.length) * 100 : 0;
      
      const avgRating = filteredRating.length > 0 
        ? filteredRating.reduce((sum, rating) => sum + rating.rating, 0) / filteredRating.length 
        : 0;
      const customerSatisfaction = (avgRating / 5) * 100;

      // Generate chart data
      const chartData = generateChartData(acceptedOrders);

      // Get top 5 orders by value (only orders with supplier_vendor_detail)
      const topOrders: TopOrder[] = acceptedOrders
        .filter(order => order.supplier_vendor_detail !== null && order.supplier_vendor_detail !== undefined)
        .sort((a, b) => parseFloat(b.harga_diajukan) - parseFloat(a.harga_diajukan))
        .slice(0, 5)
        .map(order => ({
          name: order.nama_produk,
          company: order.supplier_vendor_detail!.company_name, // Safe to use ! since we filtered out nulls
          amount: parseFloat(order.harga_diajukan)
        }));

      setData({
        inventoryQuantity: stockData.total_stok,
        totalProducts: stockData.jumlah_produk,
        orderFulfillmentRate: Math.round(orderFulfillmentRate),
        returnRate: Math.round(returnRate * 10) / 10, // Round to 1 decimal
        customerSatisfaction: Math.round(customerSatisfaction),
        chartData,
        topOrders
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when date range changes
  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // Handle date range change
  const handleDateRangeChange = (field: keyof DateRange, value: string): void => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxChartValue = Math.max(...data.chartData.map(d => d.amount));

  return (
    <div className="min-h-screen bg-gray-50">
        <ProtectedRoute requiredRole={["admin", "manager"]}>
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-bold text-xl">
                InvoTrax
              </Link>
              <Navbar />
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="border-none outline-none text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="border-none outline-none text-sm"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Inventory Quantity</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(data.inventoryQuantity)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Order Fulfillment Rate</p>
                <p className="text-3xl font-bold text-gray-900">{data.orderFulfillmentRate}%</p>

              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Return Rate</p>
                <p className="text-3xl font-bold text-gray-900">{data.returnRate}%</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Kepuasan Pelanggan</p>
                <p className="text-3xl font-bold text-gray-900">{data.customerSatisfaction}%</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Overview Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="h-64 flex">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between text-xs text-gray-500 mr-4 py-2">
                <span>Rp{Math.round(maxChartValue / 1000000)}M</span>
                <span>Rp{Math.round(maxChartValue / 2 / 1000000)}M</span>
                <span>Rp0</span>
              </div>
              
              {/* Chart bars */}
              <div className="flex items-end justify-between h-full space-x-2 flex-1">
                {data.chartData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="w-full flex items-end justify-center mb-2" style={{ height: '200px' }}>
                      <div 
                        className="bg-gray-800 rounded-t w-full max-w-8 transition-all duration-500"
                        style={{ 
                          height: maxChartValue > 0 ? `${(item.amount / maxChartValue) * 180}px` : '2px',
                          minHeight: '2px'
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">{item.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Orders */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Pesanan dengan Nilai Tertinggi</h3>
            
            <div className="space-y-4">
              {data.topOrders.length > 0 ? (
                data.topOrders.map((order, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">{order.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{order.name}</p>
                      <p className="text-xs text-gray-500 truncate">{order.company}</p>
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(order.amount)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">No orders found in selected date range</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </ProtectedRoute>
    </div>
  );
};

export default Dashboard;