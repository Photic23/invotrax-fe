"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";

interface Product {
  id: number;
  nama: string;
  kategori_detail: { id: number; nama: string };
  vendor_detail: { id: number; company_name: string };
  kontrak?: string;
  stok: number;
  deskripsi: string;
  harga: number;
}

interface ProductDetailProps {
  productId: number;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function fetchProductDetail() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_stok/produk/${productId}/detail_produk/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          toast({
            title: "Error",
            description: "Gagal mengambil detail produk",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching product detail:", error);
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat mengambil data produk",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductDetail();
  }, [productId, token, toast]);

  const handleDeleteProduct = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_stok/produk/${productId}/hapus_produk/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast({
          title: "Sukses",
          description: "Produk berhasil dihapus",
          variant: "default",
        });
        router.push("/produk");
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: "Gagal menghapus produk",
          variant: "destructive",
        });
        console.error("Delete error:", errorData);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus produk",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!product) {
    return <p>Produk tidak ditemukan.</p>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="relative">
        <button
          onClick={() => router.push("/produk")}
          className="absolute left-4 top-4 flex items-center text-gray-600 hover:text-blue-800 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Kembali</span>
        </button>
        <CardTitle className="text-2xl font-bold text-center">
          Detail Produk {product.nama}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Nama Produk</Label>
          <p>{product.nama}</p>
        </div>
        <div>
          <Label>Kategori Produk</Label>
          <p>{product.kategori_detail.nama}</p>
        </div>
        <div>
          <Label>Nama Supplier</Label>
          <p>{product.vendor_detail.company_name}</p>
        </div>
        <div>
          <Label>Kontrak</Label>
          <p>{product.kontrak || "Tidak ada data kontrak"}</p>
        </div>
        <div>
          <Label>Jumlah Stok Tersedia</Label>
          <p>{product.stok}</p>
        </div>
        <div>
          <Label>Deskripsi Produk</Label>
          <p>{product.deskripsi}</p>
        </div>
        <div>
          <Label>Harga Produk</Label>
          <p>Rp {product.harga.toLocaleString()}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={() => router.push(`/produk/${productId}/update`)}>
          Ubah Produk
        </Button>
        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
          Hapus Produk
        </Button>
      </CardFooter>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p className="mb-4">Apakah Anda yakin ingin menghapus produk ini?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Hapus Produk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}