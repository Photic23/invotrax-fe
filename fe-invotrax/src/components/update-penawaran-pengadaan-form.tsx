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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface Category {
  id: number;
  nama: string;
}

interface Supplier {
  id: number;
  company_name: string;
}

interface EditPenawaranPengadaanFormProps {
  penawaranId: number;
}

export default function EditPenawaranPengadaanForm({ penawaranId }: EditPenawaranPengadaanFormProps) {
  const token = localStorage.getItem("token");
  const router = useRouter();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState({
    supplier: "",
    nama_produk: "",
    kategori: "",
    jumlah_produk: "",
    url_foto_produk: "",
    deskripsi_produk: "",
    harga_diajukan: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, suppliersRes, penawaranRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kategori/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/users/?role=vendor`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penawaran/${penawaranId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [categoriesData, suppliersData, penawaranData] = await Promise.all([
          categoriesRes.json(),
          suppliersRes.json(),
          penawaranRes.json(),
        ]);

        setCategories(categoriesData);
        setSuppliers(suppliersData);
        setFormData({
          supplier: penawaranData.supplier_vendor.id.toString(),
          nama_produk: penawaranData.nama_produk,
          kategori: penawaranData.kategori_produk.toString(),
          jumlah_produk: penawaranData.jumlah_produk.toString(),
          url_foto_produk: penawaranData.url_foto_produk || "",
          deskripsi_produk: penawaranData.deskripsi_produk || "",
          harga_diajukan: penawaranData.harga_diajukan.toString(),
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

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penawaran/${penawaranId}/update_penawaran/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Sukses",
          description: "Penawaran pengadaan berhasil diupdate.",
        });
        router.push("/penawaran-pengadaan");
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        toast({
          title: "Error",
          description: "Gagal memperbarui penawaran pengadaan.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Request Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Penawaran Pengadaan</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <Label>Nama Produk</Label>
            <Input name="nama_produk" value={formData.nama_produk} onChange={handleChange} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Mengupdate..." : "Update Penawaran"}</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
