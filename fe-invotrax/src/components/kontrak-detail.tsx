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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";

interface PenawaranDetail {
  id: number;
  nama_produk: string;
  jumlah_produk: number;
  deskripsi_produk: string;
  url_foto_produk: string;
  harga_diajukan: string;
  status: string;
  created_at: string;
  is_deleted: boolean;
  supplier_vendor: number;
  kategori_produk: number;
}

interface Kontrak {
  id: number;
  penawaran_detail: PenawaranDetail;
  start_date: string;
  end_date: string;
  dokumen_kontrak: string;
  created_at: string;
  is_deleted: boolean;
}

interface KontrakDetailProps {
  kontrakId: number;
}

export default function KontrakDetail({ kontrakId }: KontrakDetailProps) {
  const [kontrak, setKontrak] = useState<Kontrak | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function fetchKontrakDetail() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_kontrak/kontrak/${kontrakId}`,
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
          setKontrak(data);
        } else {
          toast({
            title: "Error",
            description: "Gagal mengambil detail kontrak",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching contract detail:", error);
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat mengambil data kontrak",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchKontrakDetail();
  }, [kontrakId, token, toast]);

  const handleDeleteKontrak = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_kontrak/kontrak/${kontrakId}/hapus/`,
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
          description: "Kontrak berhasil dihapus",
          variant: "default",
        });
        router.push("/kontrak");
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: "Gagal menghapus kontrak",
          variant: "destructive",
        });
        console.error("Delete error:", errorData);
      }
    } catch (error) {
      console.error("Error deleting contract:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus kontrak",
        variant: "destructive",
      });
    }
  };

  // Format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Extract filename from URL
  const getFilenameFromUrl = (url: string) => {
    if (!url) return "";
    return url.split("/").pop() || "";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  if (!kontrak) {
    return <p>Kontrak tidak ditemukan.</p>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="relative">
        <button
          onClick={() => router.push("/kontrak")}
          className="absolute left-4 top-4 flex items-center text-gray-600 hover:text-blue-800 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Kembali</span>
        </button>
        <CardTitle className="text-2xl font-bold text-center">
          Detail Kontrak #{kontrak.id}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Kode Transaksi</Label>
          <p>{kontrak.penawaran_detail.id}</p>
        </div>
        <div>
          <Label>Tanggal Mulai</Label>
          <p>{formatDate(kontrak.start_date)}</p>
        </div>
        <div>
          <Label>Tanggal Berakhir</Label>
          <p>{formatDate(kontrak.end_date)}</p>
        </div>
        <div>
          <Label>Dokumen Kontrak (PDF)</Label>
          <div className="flex gap-4">
            <Input
              value={getFilenameFromUrl(kontrak.dokumen_kontrak)}
              readOnly
              className="flex-[3]"
            />
            <Button variant="outline" asChild className="flex-[1]">
              <a
                href={kontrak.dokumen_kontrak}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center"
              >
                Open File
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={() => router.push(`/kontrak/${kontrakId}/update`)}>
          Ubah Kontrak
        </Button>
        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
          Hapus Kontrak
        </Button>
      </CardFooter>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p className="mb-4">Apakah Anda yakin ingin menghapus kontrak ini?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteKontrak}>
              Hapus Kontrak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
