"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface UpdatePenawaranPengadaanFormProps {
  penawaranId: number;
}

export default function UpdatePenawaranPengadaanForm({ penawaranId }: UpdatePenawaranPengadaanFormProps) {
  const { getToken } = useAuth();
  const token = getToken();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nama_supplier: "",
    nama_produk: "",
    kategori_produk: "",
    jumlah_produk: "",
    url_foto_produk: "",
    deskripsi_produk: "",
    harga_diajukan: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchPenawaran = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/penawaran-pengadaan/${penawaranId}/`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Gagal mengambil data penawaran.");

        const data = await response.json();
        setFormData({
          nama_supplier: data.supplier_vendor?.company_name || "Supplier tidak ditemukan",
          nama_produk: data.nama_produk || "Produk tidak ditemukan",
          kategori_produk: data.kategori_produk?.nama || "Kategori tidak ditemukan",
          jumlah_produk: data.jumlah_produk?.toString() || "",
          url_foto_produk: data.url_foto_produk || "",
          deskripsi_produk: data.deskripsi_produk || "",
          harga_diajukan: data.harga_diajukan?.toString() || "",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal mengambil data penawaran.",
          variant: "destructive",
        });
      }
    };

    if (token) fetchPenawaran();
  }, [penawaranId, token, toast]);

  const isValidURL = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch (error) {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.jumlah_produk) {
      newErrors.jumlah_produk = "Jumlah produk harus diisi";
    } else if (parseInt(formData.jumlah_produk) <= 0) {
      newErrors.jumlah_produk = "Jumlah produk harus lebih dari 0";
    }

    if (formData.url_foto_produk && !isValidURL(formData.url_foto_produk)) {
      newErrors.url_foto_produk = "URL Foto Produk tidak valid. Harus dimulai dengan http:// atau https://";
    }

    if (!formData.deskripsi_produk.trim()) {
      newErrors.deskripsi_produk = "Deskripsi produk harus diisi";
    }

    if (!formData.harga_diajukan || isNaN(parseFloat(formData.harga_diajukan))) {
      newErrors.harga_diajukan = "Harga harus berupa angka";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); 
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
      const payload = {
        jumlah_produk: parseInt(formData.jumlah_produk),
        url_foto_produk: formData.url_foto_produk,
        deskripsi_produk: formData.deskripsi_produk,
        harga_diajukan: parseFloat(formData.harga_diajukan.replace(/,/g, '')),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/penawaran-pengadaan/${penawaranId}/update_penawaran_pengadaan/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        toast({
          title: "Sukses",
          description: "Penawaran pengadaan berhasil diperbarui.",
        });
        router.push("/penawaran-pengadaan");
      } else {
        toast({
          title: "Error",
          description: "Gagal mengupdate penawaran pengadaan.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengupdate penawaran.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Update Penawaran Pengadaan</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* <div>
            <Label>Nama Supplier</Label>
            <p className="text-sm mt-1">{formData.nama_supplier}</p>
          </div> */}

          <div>
            <Label>Nama Produk</Label>
            <p className="text-sm mt-1">{formData.nama_produk}</p>
          </div>

          {/* <div>
            <Label>Kategori Produk</Label>
            <p className="text-sm mt-1">{formData.kategori_produk}</p>
          </div> */}

          <div>
            <Label>Jumlah Produk</Label>
            <Input name="jumlah_produk" value={formData.jumlah_produk} onChange={handleChange} type="number" />
            {errors.jumlah_produk && <p className="text-red-500">{errors.jumlah_produk}</p>}
          </div>

          <div>
            <Label>URL Foto Produk</Label>
            <Input name="url_foto_produk" value={formData.url_foto_produk} onChange={handleChange} />
            {errors.url_foto_produk && <p className="text-red-500">{errors.url_foto_produk}</p>}
          </div>

          <div>
            <Label>Deskripsi Produk</Label>
            <Textarea name="deskripsi_produk" value={formData.deskripsi_produk} onChange={handleChange} />
            {errors.deskripsi_produk && <p className="text-red-500">{errors.deskripsi_produk}</p>}
          </div>

          <div>
            <Label>Harga yang Diajukan (per unit)</Label>
            <Input name="harga_diajukan" value={formData.harga_diajukan} onChange={handleChange} />
            {errors.harga_diajukan && <p className="text-red-500">{errors.harga_diajukan}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Mengupdate..." : "Update Supply"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}