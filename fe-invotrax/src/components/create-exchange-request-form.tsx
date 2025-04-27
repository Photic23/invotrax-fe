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

interface Pengajuan {
  id: number;
  nama_produk: string;
  jumlah_produk: string;
  deskripsi_produk: string;
}

// interface ExchangeRequest {
//   id: number;
//   pengajuan: number;
//   pengajuan_detail: Pengajuan;
//   alasan_penukaran: string;
//   url_foto_penukaran: string;
// }

interface CreateExchangeProps {
  pengajuanId: number;
}

export default function CreateExchangeRequestForm({ pengajuanId }: CreateExchangeProps) {
  const { getToken } = useAuth();
  const token = getToken();
  const router = useRouter();
  const { toast } = useToast();

  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    alasan_penukaran: "",
    url_foto_penukaran: "",
  });

  // useEffect(() => { fetchPengajuanDetail();}, [pengajuanId, token, toast]);

  //   async function fetchPengajuanDetail() {
  //       try {
  //           setIsLoading(true);
  //           const response = await fetch(
  //               `${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan/pengajuan_penawaran_pengadaan/${pengajuanId}/`,
  //               {
  //                   method: "GET",
  //                   headers: {
  //                       Authorization: `Bearer ${token}`,
  //                       "Content-Type": "application/json",
  //                   },
  //               }
  //           );
  //           if (response.ok) {
  //               const data = await response.json();
  //               setPengajuan(data);
  //           } else {
  //               toast({
  //                   title: "Error",
  //                   description: "Gagal mengambil detail pengajuan",
  //                   variant: "destructive",
  //               });
  //           }
  //       } catch (error) {
  //           console.error("Error fetching pengajuan detail:", error);
  //           toast({
  //               title: "Error",
  //               description: "Terjadi kesalahan saat mengambil data pengajuan",
  //               variant: "destructive",
  //           });
  //       } finally {
  //           setIsLoading(false);
  //       }
  //   }

  useEffect(() => {
    const fetchPengajuan = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan/pengajuan_penawaran_pengadaan/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Gagal mengambil data pengajuan berhubungan.");

        const data = await response.json();
                setPengajuan(data);
                
      } catch (error) {
        console.error("Error fetching related pengajuan:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil data pengajuan berhubungan.",
          variant: "destructive",
        });
      }
    };

    if (token) {
      fetchPengajuan();
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.alasan_penukaran) {
      newErrors.alasan_penukaran = "Alasan penukaran harus diisi";
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
      let url_foto_penukaran = formData.url_foto_penukaran;
      if (url_foto_penukaran && !url_foto_penukaran.match(/^https?:\/\//)) {
        // If it's not a URL, make it null so Django accepts it as text
        url_foto_penukaran = "";
      }
      
      // Prepare payload with proper Django-compatible format
      const payload = {
        alasan_penukaran: formData.alasan_penukaran || null,
        url_foto_penukaran: url_foto_penukaran,
      };
      
      console.log("Sending payload:", payload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/layanan_pasca_beli/exchange/`, {
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
          description: "Request berhasil diajukan.",
        });
        router.push("/exchange");
      } else {
        // Handle error response
        if (responseData) {
          // Handle validation errors from Django
          if (responseData.alasan_penukaran) {
            setErrors(prev => ({...prev, alasan_penukaran: responseData.alasan_penukaran[0]}));
          }
          if (responseData.url_foto_penukaran) {
            setErrors(prev => ({...prev, url_foto_penukaran: responseData.url_foto_penukaran[0]}));
          }
          
          const errorMessage = responseData.detail || 
                              responseData.message || 
                              "Gagal mengajukan exchange request.";
          
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
        description: "Terjadi kesalahan dalam pembuatan request.",
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
          Buat Exchange Request
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">

          {/* Nama Produk */}
          <div>
            <Label>Nama Produk</Label>
            <p>{pengajuan?.nama_produk}</p>
          </div>

          {/* Jumlah Produk */}
          <div>
            <Label>Jumlah Produk</Label>
            <p>{pengajuan?.jumlah_produk}</p>
          </div>

          {/* Deskripsi Produk */}
          <div>
            <Label>Deskripsi Produk</Label>
            <p>{pengajuan?.deskripsi_produk}</p>
          </div>

          {/* Alasan Penukaran Barang */}
          <div>
            <Label htmlFor="alasan_penukaran">Alasan Penukaran Barang</Label>
            <Textarea
              id="alasan_penukaran"
              name="alasan_penukaran"
              value={formData.alasan_penukaran}
              onChange={handleChange}
              placeholder="Masukkan alasan barang perlu ditukarkan"
              rows={4}
              className={errors.alasan_penukaran ? "border-red-500" : ""}
            />
            {errors.alasan_penukaran && (
              <p className="text-red-500 text-sm mt-1">{errors.alasan_penukaran}</p>
            )}
          </div>

          {/* URL Foto Penukaran - changed to text input */}
          <div>
            <Label htmlFor="url_foto_penukaran">URL Foto Produk Untuk Ditukar (Text)</Label>
            <Input
              id="url_foto_penukaran"
              name="url_foto_penukaran"
              value={formData.url_foto_penukaran}
              onChange={handleChange}
              placeholder="Masukkan Text Foto Produk Yang Perlu Ditukarkan"
              type="text"
              className={errors.url_foto_penukaran ? "border-red-500" : ""}
            />
            {errors.url_foto_produk && (
              <p className="text-red-500 text-sm mt-1">{errors.url_foto_penukaran}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Mengajukan..." : "Ajukan Penukaran"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
