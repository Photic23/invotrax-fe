"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface PengajuanDetail {
  id: number;
  nama_produk: string;
  jumlah_produk: number;
  deskripsi_produk: string;
  tanggal_penerimaan?: string;
}

// interface ExchangeRequest {
//   id: number;
//   pengajuan: number;
//   pengajuan_detail: PengajuanDetail;
//   tanggal_penerimaan?: string;
// }

interface CreatePenilaianFormProps {
  pengajuanId: number;
}

export default function CreatePenilaianForm({ pengajuanId }: CreatePenilaianFormProps) {
  // const [exchangeRequest, setExchangeRequest] = useState<ExchangeRequest | null>(null);
  const [pengajuan, setPengajuan] = useState<PengajuanDetail | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
  //   const fetchExchange = async () => {
  //     try {
  //       const res = await fetch(
  //         `${process.env.NEXT_PUBLIC_API_URL}/api/layanan_pasca_beli/exchange-request/${exchangeId}/`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );

  //       if (!res.ok) throw new Error("Gagal mengambil data exchange");

  //       const data = await res.json();
  //       setExchangeRequest(data);
  //     } catch (error) {
  //       toast({
  //         title: "Gagal",
  //         description: "Tidak dapat mengambil data exchange request.",
  //         variant: "destructive",
  //       });
  //     }
  //   };

  //   if (token) fetchExchange();
  // }, [exchangeId, token, toast]);

    const fetchPengajuan = async () => {
      if (!pengajuanId) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan/pengajuan_penawaran_pengadaan/${pengajuanId}/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Gagal mengambil detail pengajuan.");

        const data = await response.json();
        setPengajuan(data);
      } catch (error) {
        console.error("Error fetching pengajuan detail:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil detail pengajuan.",
          variant: "destructive",
        });
      }
    };

    if (token) {
      fetchPengajuan();
    }
  }, [pengajuanId, token, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!rating || !exchangeRequest) {
    //   toast({
    //     title: "Data tidak lengkap",
    //     description: "Pastikan rating dipilih dan data exchange tersedia.",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    if (!rating || !pengajuan) {
      toast({
        title: "Data tidak lengkap",
        description: "Pastikan rating dipilih dan data pengajuan tersedia.",
        variant: "destructive",
      });
      return;
    }


    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/rating/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          deskripsi: description,
          // exchange_request: exchangeRequest.id,
          pengajuan: pengajuan.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengirim penilaian");
      }

      toast({
        title: "Berhasil",
        description: "Penilaian berhasil dikirim.",
      });

      setRating(null);
      setDescription("");

      // Redirect ke halaman list exchange
      router.push(`/pengajuan_penawaran_pengadaan/${pengajuanId}`);
    } catch (error) {
      toast({
        title: "Gagal mengirim",
        description: "Terjadi kesalahan saat mengirim penilaian.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Survey Penilaian Kepuasan ID {pengajuanId}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {pengajuan && (
            <>
              <div>
                <Label htmlFor="productName">Nama Barang</Label>
                <Input
                  id="productName"
                  value={pengajuan.nama_produk || ""}
                  readOnly
                />
              </div>

              <div>
                <Label htmlFor="quantity">Jumlah Barang</Label>
                <Input
                  id="quantity"
                  value={pengajuan.jumlah_produk || ""}
                  readOnly
                />
              </div>

              {pengajuan.tanggal_penerimaan && (
                <div>
                  <Label htmlFor="receiveDate">Tanggal Penerimaan</Label>
                  <Input
                    id="receiveDate"
                    type="date"
                    value={pengajuan.tanggal_penerimaan}
                    readOnly
                  />
                </div>
              )}
            </>
          )}

          <div>
            <Label>Rating</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant={rating === num ? "default" : "outline"}
                  className="rounded-full w-10 h-10 p-0 text-lg"
                  onClick={() => setRating(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Deskripsi Penilaian</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Ceritakan pengalaman Anda..."
              required
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full">
            Kirim Penilaian
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
