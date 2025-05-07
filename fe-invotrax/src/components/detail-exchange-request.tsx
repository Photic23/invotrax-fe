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
import { useAuth } from "@/contexts/AuthContext";
import Status from "./elements/detail/Status";

interface Pengajuan {
  id: number;
  nama_produk: string;
  kategori_produk_detail: { id: number; nama: string };
  jumlah_produk: string;
  deskripsi_produk: string;
}

interface ExchangeRequest {
  id: number;
  nama_produk: string;
  alasan_penukaran: string;
  url_foto_penukaran: string;
  pengajuan: number;
  status: string;
}

interface ExchangeRequestDetailProps {
  exchangeId: number;
}

export default function ExchangeRequestDetail({
  exchangeId,
}: ExchangeRequestDetailProps) {
  const [exchangeRequest, setExchangeRequest] = useState<ExchangeRequest | null>(null);
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogType, setDialogType] = useState<keyof typeof dialogConfig | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/layanan_pasca_beli/exchange-request/${exchangeId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Gagal mengambil data exchange request");

        const exchangeData = await response.json();
        setExchangeRequest(exchangeData);

        if (exchangeData.pengajuan) {
          const pengajuanResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan/pengajuan_penawaran_pengadaan/${exchangeData.pengajuan}/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!pengajuanResponse.ok)
            throw new Error("Gagal mengambil data pengajuan");

          const pengajuanData = await pengajuanResponse.json();
          setPengajuan(pengajuanData);
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat mengambil data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [exchangeId, token]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!exchangeRequest) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/layanan_pasca_beli/exchange-request/${exchangeId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Gagal update status");

      setExchangeRequest({ ...exchangeRequest, status: newStatus });
      toast({ title: "Success", description: "Status berhasil diperbarui." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExchange = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/layanan_pasca_beli/exchange-request/${exchangeId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Gagal menghapus exchange request");

      toast({
        title: "Sukses",
        description: "Exchange request berhasil dihapus.",
      });

      router.push("/exchange/list");
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus exchange request.",
        variant: "destructive",
      });
    }
  };

  const dialogConfig = {
    hapus: {
      title: "Konfirmasi Hapus",
      description: "Apakah Anda yakin ingin menghapus request ini?",
      actionText: "Hapus",
      variant: "destructive" as const,
      onConfirm: handleDeleteExchange,
    },
    setuju: {
      title: "Konfirmasi Setuju",
      description: "Apakah Anda yakin ingin menyetujui request ini?",
      actionText: "Setujui",
      variant: "default" as const,
      onConfirm: () => handleUpdateStatus("diproses"),
    },
    tolak: {
      title: "Konfirmasi Tolak",
      description: "Apakah Anda yakin ingin menolak request ini?",
      actionText: "Tolak",
      variant: "destructive" as const,
      onConfirm: () => handleUpdateStatus("ditolak"),
    },
    kirim: {
      title: "Konfirmasi Kirim",
      description: "Apakah Anda yakin ingin mengirim pesanan ini?",
      actionText: "Kirim",
      variant: "default" as const,
      onConfirm: () => handleUpdateStatus("dikirim"),
    },
    terima: {
      title: "Konfirmasi Terima",
      description: "Apakah Anda yakin ingin menerima pesanan ini?",
      actionText: "Terima",
      variant: "default" as const,
      onConfirm: () => handleUpdateStatus("diterima"),
    },
  };

  if (isLoading) return <p>Loading...</p>;
  if (!exchangeRequest) return <p>Exchange request not found.</p>;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="flex-row justify-between items-center p-4">
        <button
          onClick={() => router.push("/exchange-request")}
          className="flex items-center text-gray-600 hover:text-blue-800 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Kembali</span>
        </button>
        <CardTitle className="text-2xl font-bold text-center">Exchange Request</CardTitle>
        <Status status={exchangeRequest.status} />
      </CardHeader>

      <CardContent className="space-y-4">
        {pengajuan && (
          <>
            <div>
              <Label>Product Name</Label>
              <p>{pengajuan.nama_produk}</p>
            </div>
            <div>
              <Label>Product Category</Label>
              <p>{pengajuan.kategori_produk_detail.nama}</p>
            </div>
            <div>
              <Label>Quantity</Label>
              <p>{pengajuan.jumlah_produk}</p>
            </div>
            <div>
              <Label>Description</Label>
              <p>{pengajuan.deskripsi_produk}</p>
            </div>
          </>
        )}
        <div>
          <Label>Reason for Exchange</Label>
          <p>{exchangeRequest.alasan_penukaran}</p>
        </div>
        <div>
          <Label>Exchange Photo</Label>
          <p>
            <a
              href={exchangeRequest.url_foto_penukaran}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-800 hover:underline"
            >
              {exchangeRequest.url_foto_penukaran}
            </a>
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 justify-between">
        {user?.role === "customer" ? (
          <>
            {exchangeRequest.status === "dikirim" && (
              <Button onClick={() => setDialogType("terima")}>Diterima</Button>
            )}
            {exchangeRequest.status === "diterima" && (
              <Button onClick={() => router.push(`/penilaian/${pengajuan?.id}`)}>
                Buat Penilaian
              </Button>
            )}
            {exchangeRequest.status === "ditolak" && (
              <Button variant="destructive" onClick={() => setDialogType("hapus")}>Hapus Exchange</Button>
            )}
            {exchangeRequest.status === "diproses" && (
              <p className="text-sm text-muted-foreground">Menunggu pengiriman dari admin.</p>
            )}
            {!["diterima", "dikirim", "ditolak", "diproses"].includes(exchangeRequest.status) && (
              <>
                <Button onClick={() => router.push(`/exchange/${exchangeId}/update`)}>
                  Update Exchange
                </Button>
                <Button variant="destructive" onClick={() => setDialogType("hapus")}>Hapus Exchange</Button>
              </>
            )}
          </>
        ) : (
          <>
            {exchangeRequest.status === "diajukan" && (
              <>
                <Button onClick={() => setDialogType("setuju")}>Setujui Exchange</Button>
                <Button variant="destructive" onClick={() => setDialogType("tolak")}>Tolak Exchange</Button>
              </>
            )}
            {exchangeRequest.status === "diproses" && (
              <Button onClick={() => setDialogType("kirim")}>Kirim Exchange</Button>
            )}
          </>
        )}
      </CardFooter>

      <Dialog open={!!dialogType} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="sm:max-w-md">
          {dialogType && (
            <>
              <DialogHeader>
                <DialogTitle>{dialogConfig[dialogType].title}</DialogTitle>
              </DialogHeader>
              <p className="mb-4">{dialogConfig[dialogType].description}</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogType(null)}>Batal</Button>
                <Button
                  variant={dialogConfig[dialogType].variant}
                  onClick={() => {
                    dialogConfig[dialogType].onConfirm();
                    setDialogType(null);
                  }}
                >
                  {dialogConfig[dialogType].actionText}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
