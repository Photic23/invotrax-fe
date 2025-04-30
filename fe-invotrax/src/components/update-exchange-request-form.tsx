"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  } from "@/components/ui/dialog";  
import { useToast } from "@/hooks/use-toast";

interface ExchangeRequest {
  id: number;
  alasan_penukaran: string;
  url_foto_penukaran: string;
  pengajuan: number;        //foreign ID for related pengajuan
}

interface Pengajuan {
  id: number;
  nama_produk: string;
  jumlah_produk: string;
  deskripsi_produk: string;}

interface UpdateExchangeProps {
  exchangeId: number;
}

export default function UpdateExchangeRequestForm({ exchangeId }: UpdateExchangeProps) {
  const token = localStorage.getItem("token");
  const router = useRouter();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formData, setFormData] = useState({
    alasan_penukaran: "",
    url_foto_penukaran: "",
  });

  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);  
  const [exchange, setExchange] = useState<ExchangeRequest | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchPengajuanDetail = async (pengajuanId: number) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan/pengajuan_penawaran_pengadaan/${pengajuanId}/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Gagal mengambil data pengajuan berhubungan.");

        const pengajuanData = await response.json();
        console.log("Fetched Pengajuan Detail:", pengajuanData);
        setPengajuan(pengajuanData);
                
      } catch (error) {
        console.error("Error fetching related pengajuan:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil data pengajuan berhubungan.",
          variant: "destructive",
        });
      }
    };

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/layanan_pasca_beli/exchange-request/${exchangeId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const exchangeData = await response.json();
        console.log("Fetched exchangeData:", exchangeData);

        setExchange(exchangeData);

        if (exchangeData.pengajuan) {
          fetchPengajuanDetail(exchangeData.pengajuan);
        }

        setFormData({
          alasan_penukaran: exchangeData.alasan_penukaran || "",
          url_foto_penukaran: exchangeData.url_foto_penukaran || "",
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil data exchange request.",
          variant: "destructive",
        });
      }
    };

    if (token) {
      fetchData();
    }
  }, [exchangeId, toast, token]);  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.alasan_penukaran) {
      newErrors.alasan_penukaran = "Alasan penukaran harus diisi";
    }

    if (!formData.url_foto_penukaran) {
      newErrors.url_foto_penukaran = "Foto bukti produk yang akan ditukar harus diisi";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    // Make sure the URL is valid by prefixing with https:// if needed
    let url_foto_penukaran = formData.url_foto_penukaran;
    if (url_foto_penukaran && !url_foto_penukaran.match(/^https?:\/\//)) {
      // If it's not a URL, make it null so Django accepts it as text
      url_foto_penukaran = "";
    }
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/layanan_pasca_beli/exchange-request/${exchangeId}/update_exchange_request/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
          }),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        toast({
          title: "Sukses",
          description: "Exchange request berhasil diupdate.",
        });
        router.push("/exchange/list");
      } else {
        if (response.status === 400 && responseData) {
          if (responseData.alasan_penukaran) {
            setErrors(prev => ({...prev, alasan_penukaran: responseData.alasan_penukaran[0]}));
          }
          if (responseData.url_foto_penukaran) {
            setErrors(prev => ({...prev, url_foto_penukaran: responseData.url_foto_penukaran[0]}));
          }
        }

        const fallbackMessage = responseData.detail || "Terjadi kesalahan saat memperbarui exchange request.";
        toast({
          title: "Error",
          description: fallbackMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Request Error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan pada koneksi atau server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Exchange Request EXC-{exchangeId}</CardTitle>
      </CardHeader>
      <form onSubmit={(e) => {
        e.preventDefault();
        if (!validateForm()) {
          toast({
            title: "Error",
            description: "Harap perbaiki kesalahan pada form",
            variant: "destructive",
          });
          return;
        }
        setConfirmOpen(true);
      }}>
        <CardContent>
          <div className="space-y-4">
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
              <Label>Alasan Penukaran Barang</Label>
              <Textarea
                name="alasan_penukaran"
                value={formData.alasan_penukaran}
                onChange={handleChange}
                className={errors.alasan_penukaran ? "border-red-500" : ""}
              />
              {errors.alasan_penukaran && (
                <p className="text-red-500 text-sm mt-1">{errors.alasan_penukaran}</p>
              )}
            </div>

          {/* URL Foto Penukaran */}
          <div>
              <Label>URL Foto Produk Untuk Ditukar (Text)</Label>
              <Input
                type="url"
                name="url_foto_penukaran"
                value={formData.url_foto_penukaran}
                onChange={handleChange}
                className={errors.url_foto_penukaran ? "border-red-500" : ""}
              />
              {errors.url_foto_penukaran && (
                <p className="text-red-500 text-sm mt-1">{errors.url_foto_penukaran}</p>
              )}
            </div>

            {errorMessage && (
              <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Mengupdate..." : "Update Exchange Request"}
          </Button>
        </CardFooter>
      </form>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Konfirmasi Update</DialogTitle>
            </DialogHeader>
            <p className="mb-4">Apakah Anda yakin ingin mengubah request ini?</p>
            <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Batal
                </Button>
                <Button variant="secondary" onClick={handleSubmit}>
                Ubah
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>

    </Card>
  );
}
