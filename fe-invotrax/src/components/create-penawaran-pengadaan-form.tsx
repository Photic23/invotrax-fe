"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

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

export default function CreatePenawaranPengadaanForm() {
  const { getToken } = useAuth();
  const token = getToken();
  const router = useRouter();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplier_vendor: "",
    nama_produk: "",
    kategori_produk: "",
    jumlah_produk: "",
    url_foto_produk: "",
    deskripsi_produk: "",
    harga_diajukan: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kategori/`, {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nama_produk) {
      newErrors.nama_produk = "Nama produk harus diisi";
    }
    
    if (!formData.supplier_vendor) {
      newErrors.supplier_vendor = "Supplier harus dipilih";
    }
    
    if (!formData.kategori_produk) {
      newErrors.kategori_produk = "Kategori harus dipilih";
    }
    
    if (!formData.jumlah_produk) {
      newErrors.jumlah_produk = "Jumlah produk harus diisi";
    } else if (parseInt(formData.jumlah_produk) <= 0) {
      newErrors.jumlah_produk = "Jumlah produk harus lebih dari 0";
    }
    
    if (formData.harga_diajukan && isNaN(parseFloat(formData.harga_diajukan.replace(/,/g, '')))) {
      newErrors.harga_diajukan = "Harga harus berupa angka";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Harap perbaiki kesalahan pada form",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Make sure the URL is valid by prefixing with https:// if needed
      let url_foto_produk = formData.url_foto_produk;
      if (url_foto_produk && !url_foto_produk.match(/^https?:\/\//)) {
        // If it's not a URL, make it null so Django accepts it as text
        url_foto_produk = "";
      }
      
      // Prepare payload with proper Django-compatible format
      const payload = {
        supplier_vendor: formData.supplier_vendor ? parseInt(formData.supplier_vendor) : null,
        nama_produk: formData.nama_produk,
        kategori_produk: formData.kategori_produk ? parseInt(formData.kategori_produk) : null,
        jumlah_produk: formData.jumlah_produk ? parseInt(formData.jumlah_produk) : null,
        url_foto_produk: url_foto_produk,
        deskripsi_produk: formData.deskripsi_produk || null,
        harga_diajukan: formData.harga_diajukan ? parseFloat(formData.harga_diajukan.replace(/,/g, '')) : null,
      };
      
      console.log("Sending payload:", payload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penawaran/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response Status:", response.status);
      
      // Capture raw response text first for debugging
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      // Try to parse as JSON if possible
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("Response Data (parsed):", responseData);
      } catch (e) {
        console.log("Response is not valid JSON");
      }

      if (response.ok) {
        toast({
          title: "Sukses",
          description: "Penawaran Pengadaan berhasil diajukan.",
        });
        router.push("/penawaran-pengadaan");
      } else {
        // Handle error response
        if (responseData) {
          // Handle validation errors from Django
          if (responseData.supplier_vendor) {
            setErrors(prev => ({...prev, supplier_vendor: responseData.supplier_vendor[0]}));
          }
          if (responseData.nama_produk) {
            setErrors(prev => ({...prev, nama_produk: responseData.nama_produk[0]}));
          }
          if (responseData.kategori_produk) {
            setErrors(prev => ({...prev, kategori_produk: responseData.kategori_produk[0]}));
          }
          if (responseData.jumlah_produk) {
            setErrors(prev => ({...prev, jumlah_produk: responseData.jumlah_produk[0]}));
          }
          if (responseData.harga_diajukan) {
            setErrors(prev => ({...prev, harga_diajukan: responseData.harga_diajukan[0]}));
          }
          if (responseData.url_foto_produk) {
            setErrors(prev => ({...prev, url_foto_produk: responseData.url_foto_produk[0]}));
          }
          
          const errorMessage = responseData.detail || 
                              responseData.message || 
                              "Gagal mengajukan penawaran pengadaan.";
          
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: `Error ${response.status}: ${response.statusText}`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan dalam proses pengajuan.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Buat Penawaran Pengadaan
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">

          {/* Supplier */}
          <div>
            <Label htmlFor="supplier_vendor">Nama Supplier<span className="text-red-600">*</span></Label>
            <Select
              value={formData.supplier_vendor}
              onValueChange={(value) => handleSelectChange("supplier_vendor", value)}
            >
              <SelectTrigger id="supplier_vendor" className={errors.supplier_vendor ? "border-red-500" : ""}>
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
            {errors.supplier_vendor && (
              <p className="text-red-500 text-sm mt-1">{errors.supplier_vendor}</p>
            )}
          </div>

          {/* Nama Produk */}
          <div>
            <Label htmlFor="nama_produk">Nama Produk<span className="text-red-600">*</span></Label>
            <Input
              id="nama_produk"
              name="nama_produk"
              value={formData.nama_produk}
              onChange={handleChange}
              placeholder="Masukkan Nama Produk"
              className={errors.nama_produk ? "border-red-500" : ""}
            />
            {errors.nama_produk && (
              <p className="text-red-500 text-sm mt-1">{errors.nama_produk}</p>
            )}
          </div>

          {/* Kategori */}
          <div>
            <Label htmlFor="kategori_produk">Kategori<span className="text-red-600">*</span></Label>
            <Select
              value={formData.kategori_produk}
              onValueChange={(value) => handleSelectChange("kategori_produk", value)}
            >
              <SelectTrigger id="kategori_produk" className={errors.kategori_produk ? "border-red-500" : ""}>
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
            {errors.kategori_produk && (
              <p className="text-red-500 text-sm mt-1">{errors.kategori_produk}</p>
            )}
          </div>

          {/* Jumlah Produk */}
          <div>
            <Label htmlFor="jumlah_produk">Jumlah Produk<span className="text-red-600">*</span></Label>
            <Input
              id="jumlah_produk"
              name="jumlah_produk"
              value={formData.jumlah_produk}
              onChange={handleChange}
              placeholder="Masukkan Jumlah Produk"
              type="number"
              min="1"
              className={errors.jumlah_produk ? "border-red-500" : ""}
            />
            {errors.jumlah_produk && (
              <p className="text-red-500 text-sm mt-1">{errors.jumlah_produk}</p>
            )}
          </div>

          {/* Deskripsi Produk */}
          <div>
            <Label htmlFor="deskripsi_produk">Deskripsi Produk</Label>
            <Textarea
              id="deskripsi_produk"
              name="deskripsi_produk"
              value={formData.deskripsi_produk}
              onChange={handleChange}
              placeholder="Masukkan Deskripsi Produk"
              rows={4}
              className={errors.deskripsi_produk ? "border-red-500" : ""}
            />
            {errors.deskripsi_produk && (
              <p className="text-red-500 text-sm mt-1">{errors.deskripsi_produk}</p>
            )}
          </div>

          {/* URL Foto Produk - changed to text input */}
          <div>
            <Label htmlFor="url_foto_produk">Foto Produk (Text)</Label>
            <Input
              id="url_foto_produk"
              name="url_foto_produk"
              value={formData.url_foto_produk}
              onChange={handleChange}
              placeholder="Masukkan Text Foto Produk"
              type="text"
              className={errors.url_foto_produk ? "border-red-500" : ""}
            />
            <p className="text-gray-500 text-xs mt-1">
              Masukkan text deskripsi foto produk
            </p>
            {errors.url_foto_produk && (
              <p className="text-red-500 text-sm mt-1">{errors.url_foto_produk}</p>
            )}
          </div>

          {/* Harga Diajukan */}
          <div>
            <Label htmlFor="harga_diajukan">Harga Diajukan (per unit)</Label>
            <Input
              id="harga_diajukan"
              name="harga_diajukan"
              value={formData.harga_diajukan}
              onChange={handleChange}
              placeholder="Masukkan Harga Diajukan"
              type="text"
              inputMode="decimal"
              className={errors.harga_diajukan ? "border-red-500" : ""}
            />
            {errors.harga_diajukan && (
              <p className="text-red-500 text-sm mt-1">{errors.harga_diajukan}</p>
            )}
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