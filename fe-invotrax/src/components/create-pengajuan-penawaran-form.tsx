"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

// Define interfaces
interface Category {
  id: number;
  nama: string;
}

interface Supplier {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  company_name: string;
  role: string;
}

export default function CreateForm() {
  const { getToken } = useAuth();
  const token = getToken();
  const router = useRouter();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_produk: "",
    harga_diajukan: "",
    jumlah_produk: "",
    url_foto_produk: "",
    deskripsi_produk: "",
    supplier_vendor: "", // jika mau pakai
    kategori_produk: "", // jika mau pakai
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories and suppliers
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_stok/kategori/`, {
          method: "GET",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
  
        if (!response.ok) throw new Error("Gagal mengambil data kategori.");
  
        const categoriesData = await response.json();
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }
        
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil data kategori.",
          variant: "destructive",
        });
      }
    };
  
    const fetchSuppliers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/users/?role=vendor`, {
          method: "GET",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
  
        if (!response.ok) throw new Error("Gagal mengambil data supplier.");
  
        const suppliersData = await response.json();
        if (Array.isArray(suppliersData)) {
          setSuppliers(suppliersData);
        }
        
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil data supplier.",
          variant: "destructive",
        });
      }
    };
  
    if (token) {
      fetchCategories();
      fetchSuppliers();
    }
  }, [toast, token]);  

  // Handle changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_produk) newErrors.nama_produk = "Nama produk wajib diisi.";
    if (!formData.jumlah_produk || parseInt(formData.jumlah_produk) <= 0) newErrors.jumlah_produk = "Jumlah produk harus lebih dari 0.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: "Error", description: "Periksa form Anda", variant: "destructive" });
      return;
    }
  
    setIsLoading(true);
  
    try {
      const payload = {
        nama_produk: formData.nama_produk,
        jumlah_produk: parseInt(formData.jumlah_produk),
        url_foto_produk: formData.url_foto_produk || null,
        deskripsi_produk: formData.deskripsi_produk || null,
        harga_diajukan: formData.harga_diajukan ? parseFloat(formData.harga_diajukan.replace(/,/g, '')) : null,
        // Remove these if they're not expected by your backend
        supplier_vendor: formData.supplier_vendor || null,
        kategori_produk: formData.kategori_produk || null,
      };
  
      console.log("Sending payload:", payload);
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan/pengajuan_penawaran_pengadaan/`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });
  
      // Read the response data only once
      const responseData = await response.text();
      console.log("Response status:", response.status);
      console.log("Response body:", responseData);
      
      // Try to parse as JSON if possible
      let parsedData;
      try {
        parsedData = JSON.parse(responseData);
      } catch (e) {
        // If it's not valid JSON, keep the text version
        parsedData = responseData;
      }
  
      if (response.ok) {
        toast({ title: "Sukses", description: "Penawaran berhasil diajukan." });
        router.push("/pengajuan_penawaran_pengadaan");
      } else {
        // Display error details
        const errorMessage = typeof parsedData === 'object' && parsedData !== null 
          ? JSON.stringify(parsedData)
          : parsedData;
        
        toast({ 
          title: "Error", 
          description: `Gagal mengajukan: ${errorMessage}`, 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Request error:", error);
      toast({ 
        title: "Error", 
        description: "Terjadi kesalahan saat mengirim permintaan.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Buat Penawaran</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Supplier */}
          <div>
            <Label htmlFor="supplier_vendor">Nama Supplier</Label>
            <Select value={formData.supplier_vendor} onValueChange={value => handleSelectChange("supplier_vendor", value)}>
              <SelectTrigger id="supplier_vendor">
                <SelectValue placeholder="Pilih Supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nama Produk */}
          <div>
            <Label htmlFor="nama_produk">Nama Produk<span className="text-red-600">*</span></Label>
            <Input id="nama_produk" name="nama_produk" value={formData.nama_produk} onChange={handleChange} />
            {errors.nama_produk && <p className="text-red-500 text-sm mt-1">{errors.nama_produk}</p>}
          </div>

          {/* Kategori */}
          <div>
            <Label htmlFor="kategori_produk">Kategori</Label>
            <Select value={formData.kategori_produk} onValueChange={value => handleSelectChange("kategori_produk", value)}>
              <SelectTrigger id="kategori_produk">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Jumlah Produk */}
          <div>
            <Label htmlFor="jumlah_produk">Jumlah Produk<span className="text-red-600">*</span></Label>
            <Input id="jumlah_produk" name="jumlah_produk" type="number" min="1" value={formData.jumlah_produk} onChange={handleChange} />
            {errors.jumlah_produk && <p className="text-red-500 text-sm mt-1">{errors.jumlah_produk}</p>}
          </div>

          {/* Deskripsi Produk */}
          <div>
            <Label htmlFor="deskripsi_produk">Deskripsi Produk</Label>
            <Textarea id="deskripsi_produk" name="deskripsi_produk" value={formData.deskripsi_produk} onChange={handleChange} />
          </div>

          {/* Foto Produk */}
          <div>
            <Label htmlFor="url_foto_produk">URL Foto Produk</Label>
            <Input id="url_foto_produk" name="url_foto_produk" value={formData.url_foto_produk} onChange={handleChange} />
          </div>

          {/* Harga Diajukan */}
          <div>
            <Label htmlFor="harga_diajukan">Harga Diajukan</Label>
            <Input id="harga_diajukan" name="harga_diajukan" value={formData.harga_diajukan} onChange={handleChange} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Mengajukan..." : "Ajukan Penawaran"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
