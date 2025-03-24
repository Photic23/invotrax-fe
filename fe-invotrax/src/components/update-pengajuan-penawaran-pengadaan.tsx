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
import { useToast } from "@/hooks/use-toast";

interface EditPenawaranPengadaanFormProps {
  penawaranId: number;
}

export default function EditPenawaranPengadaanForm({ penawaranId }: EditPenawaranPengadaanFormProps) {
  const token = localStorage.getItem("token");
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nama_produk: "",
    jumlah_produk: "",
    deskripsi_produk: "",
    url_foto_produk: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan/pengajuanpenawaranpengadaan/${penawaranId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const penawaranData = await response.json();

        setFormData({
          nama_produk: penawaranData.nama_produk || "",
          jumlah_produk: penawaranData.jumlah_produk?.toString() || "",
          deskripsi_produk: penawaranData.deskripsi_produk || "",
          url_foto_produk: penawaranData.url_foto_produk || "",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil data penawaran pengadaan.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [penawaranId, token, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan/pengajuanpenawaranpengadaan/${penawaranId}/update_pengajuan_penawaran_pengadaan/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast({
          title: "Sukses",
          description: "Penawaran pengadaan berhasil diupdate.",
        });
        router.push("/pengajuan_penawaran_pengadaan");
      } else {
        const errorData = await response.json();

        if (response.status === 405) {
          setErrorMessage("Metode tidak diizinkan. Cek apakah API endpoint mendukung PATCH.");
        } else if (response.status === 400) {
          setErrorMessage("Gagal memperbarui data. Cek kembali input Anda.");
        } else {
          setErrorMessage("Terjadi kesalahan saat memperbarui penawaran.");
        }

        console.error("API Error:", errorData);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Request Error:", error);
      setErrorMessage("Terjadi kesalahan pada koneksi atau server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Request Pengadaan PROD-{penawaranId}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Nama Produk</Label>
              <Input
                name="nama_produk"
                value={formData.nama_produk}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Jumlah Produk</Label>
              <Input
                type="number"
                name="jumlah_produk"
                value={formData.jumlah_produk}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Deskripsi Produk</Label>
              <Textarea
                name="deskripsi_produk"
                value={formData.deskripsi_produk}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>URL Foto Produk</Label>
              <Input
                type="url"
                name="url_foto_produk"
                value={formData.url_foto_produk}
                onChange={handleChange}
              />
            </div>

            {errorMessage && (
              <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Mengupdate..." : "Update Penawaran"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
