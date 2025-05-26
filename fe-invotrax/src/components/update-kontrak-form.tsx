"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface UpdateKontrakFormProps {
  kontrakId: number;
}

export default function UpdateKontrakForm({
  kontrakId,
}: UpdateKontrakFormProps) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [formData, setFormData] = useState({
    penawaran: "",
    start_date: "",
    end_date: "",
    dokumen_kontrak: null as File | null,
  });
  const [dokumenUrl, setDokumenUrl] = useState<string>("");
  const [penawaranLabel, setPenawaranLabel] = useState<string>("");

  const fetchInitialData = async () => {
    try {
      setIsInitialLoading(true);

      const kontrakRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_kontrak/kontrak/${kontrakId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const kontrak = await kontrakRes.json();
      
      setPenawaranLabel(
        kontrak.penawaran_detail?.display_label ?? `ID ${kontrak.penawaran}`
      );

      const currentPenawaranId =
        kontrak.penawaran ?? kontrak.penawaran_detail?.id ?? null;

      setFormData({
        penawaran: currentPenawaranId ? currentPenawaranId.toString() : "",
        start_date: kontrak.start_date,
        end_date: kontrak.end_date,
        dokumen_kontrak: null,
      });
      setDokumenUrl(kontrak.dokumen_kontrak);
      setIsInitialLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast({
        title: "Error",
        description: "Gagal mengambil data kontrak",
        variant: "destructive",
      });
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [kontrakId, toast]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
  
    if (!formData.start_date) {
      newErrors.start_date = "Tanggal mulai harus diisi";
    }
  
    if (!formData.end_date) {
      newErrors.end_date = "Tanggal berakhir harus diisi";
    } else if (
      formData.start_date &&
      new Date(formData.start_date) >= new Date(formData.end_date)
    ) {
      newErrors.end_date = "Tanggal berakhir harus setelah tanggal mulai";
    }
  
    if (
      formData.dokumen_kontrak &&
      !formData.dokumen_kontrak.name.toLowerCase().endsWith(".pdf")
    ) {
      newErrors.dokumen_kontrak = "Hanya file PDF yang diperbolehkan";
    } else if (
      formData.dokumen_kontrak &&
      formData.dokumen_kontrak.size > MAX_FILE_SIZE
    ) {
      newErrors.dokumen_kontrak =
        "File terlalu besar, mohon unggah di bawah 10 MB";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "dokumen_kontrak" && files) {
      setFormData((prev) => ({ ...prev, dokumen_kontrak: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setIsLoading(true);

    try {
      const payload = new FormData();
      payload.append("penawaran", formData.penawaran);
      payload.append("start_date", formData.start_date);
      payload.append("end_date", formData.end_date);
      if (formData.dokumen_kontrak) {
        payload.append("dokumen_kontrak", formData.dokumen_kontrak);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_kontrak/kontrak/${kontrakId}/update_kontrak/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        }
      );

      if (res.ok) {
        toast({
          title: "Sukses",
          description: "Kontrak berhasil diperbarui",
          variant: "default",
        });
        router.push("/kontrak");
      } else {
        toast({
          title: "Error",
          description: "Gagal memperbarui kontrak",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating kontrak:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  if (!formData.penawaran && !dokumenUrl) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Kontrak tidak ditemukan.</p>
      </div>
    );
  }  

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="relative">
        <button
          onClick={() => router.push(`/kontrak/${kontrakId}`)}
          className="absolute left-4 top-4 flex items-center text-black-600 hover:text-blue-800 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Kembali</span>
        </button>
        <CardTitle className="text-2xl font-bold text-center">
          Ubah Kontrak
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Kode Transaksi</Label>
            <Input
              value={penawaranLabel}
              readOnly
              className="cursor-not-allowed bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Tanggal Mulai</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              className={errors.start_date ? "border-red-500" : ""}
            />
            {errors.start_date && (
              <p className="text-sm text-red-500">{errors.start_date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">Tanggal Berakhir</Label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              className={errors.end_date ? "border-red-500" : ""}
            />
            {errors.end_date && (
              <p className="text-sm text-red-500">{errors.end_date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Dokumen Kontrak (PDF)</Label>

            <div className="flex gap-4">
              <Input
                value={
                  formData.dokumen_kontrak?.name ||
                  (dokumenUrl ? dokumenUrl.split("/").pop() : "") ||
                  ""
                }
                readOnly
                className="flex-[3]"
              />

              <input
                id="dokumen_kontrak"
                name="dokumen_kontrak"
                type="file"
                accept="application/pdf"
                onChange={handleChange}
                className="hidden"
              />

              {dokumenUrl && (
                <Button variant="outline" asChild className="flex-[1]">
                  <a
                    href={dokumenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center"
                  >
                    Open File
                  </a>
                </Button>
              )}

              <Button asChild className="flex-[1]">
                <label
                  htmlFor="dokumen_kontrak"
                  className="w-full cursor-pointer text-center"
                >
                  Choose File
                </label>
              </Button>
            </div>

            {errors.dokumen_kontrak && (
              <p className="text-sm text-red-500">{errors.dokumen_kontrak}</p>
            )}

            <p className="text-xs text-gray-500 mt-1">
              File PDF maksimal 10 MB.
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Ubah Kontrak"}
          </Button>
        </CardFooter>
      </form>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Update</DialogTitle>
          </DialogHeader>
          <p>Apakah Anda yakin ingin memperbarui kontrak ini?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Batal
            </Button>
            <Button onClick={confirmSubmit} disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Ya, Perbarui"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
