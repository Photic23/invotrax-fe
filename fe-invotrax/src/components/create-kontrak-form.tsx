"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface Penawaran {
  id: number;
  kode_transaksi: string;
  display_label: string;
}

export default function CreateKontrakForm() {
  const token = localStorage.getItem("token");
  const router = useRouter();
  const { toast } = useToast();

  const [penawarans, setPenawarans] = useState<Penawaran[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    penawaran: "",
    start_date: "",
    end_date: "",
    dokumen_kontrak: null as File | null,
  });

  const normalizeList = (data: any) =>
    Array.isArray(data) ? data : data?.results ?? [];

  const getUsedPenawaranIds = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_kontrak/kontrak/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!res.ok) {
        throw new Error(`Failed to fetch kontrak data: ${res.status}`);
      }
      
      const kontraks = await res.json();
      return new Set(
        kontraks.map((k: any) => k.penawaran_detail?.id).filter(Boolean)
      );
    } catch (err) {
      console.error("Error getting used penawaran IDs:", err);
      toast({
        title: "Error",
        description: "Gagal mengambil data kontrak yang ada",
        variant: "destructive",
      });
      return new Set();
    }
  };

  const fetchPenawarans = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/penawaran/penawaran-pengadaan/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!res.ok) {
        throw new Error(`Failed to fetch penawarans: ${res.status}`);
      }
      
      const data = normalizeList(await res.json());

      const usedIds = await getUsedPenawaranIds();

      const available = data.filter((p: Penawaran) => !usedIds.has(p.id));
      setPenawarans(available);
    } catch (err) {
      console.error("Error fetching penawarans:", err);
      toast({
        title: "Error",
        description: "Gagal mengambil data penawaran",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPenawarans();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
  
    if (!formData.penawaran) {
      newErrors.penawaran = "Kode transaksi harus dipilih";
    }
  
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
  
    if (!formData.dokumen_kontrak) {
      newErrors.dokumen_kontrak = "Dokumen kontrak harus diunggah";
    } else if (!formData.dokumen_kontrak.name.toLowerCase().endsWith(".pdf")) {
      newErrors.dokumen_kontrak = "Hanya file PDF yang diperbolehkan";
    } else if (formData.dokumen_kontrak.size > MAX_FILE_SIZE) {
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
      
      if (errors.dokumen_kontrak) {
        setErrors((prev) => ({ ...prev, dokumen_kontrak: "" }));
      }
      setServerError(null);
      setDebugInfo(null);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setDebugInfo(null);

    if (!validateForm()) {
      return;
    }

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_kontrak/kontrak/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        }
      );

      if (res.ok) {
        toast({
          title: "Sukses",
          description: "Kontrak berhasil dibuat",
          variant: "default",
        });
        router.push("/kontrak");
      } else {
        let errorDetail = "Gagal membuat kontrak";
        try {
          const errorData = await res.json();
          if (errorData.detail) {
            errorDetail = errorData.detail;
          } else if (errorData.dokumen_kontrak) {
            errorDetail = `Error dokumen kontrak: ${errorData.dokumen_kontrak}`;
          } else {
            setDebugInfo(JSON.stringify(errorData, null, 2));
          }
        } catch (parseError) {
          errorDetail = `Error (${res.status}): ${res.statusText}`;
        }
        
        setServerError(errorDetail);
        
        toast({
          title: "Error",
          description: errorDetail,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error creating kontrak:", error);
      setServerError(error.message || "Terjadi kesalahan saat membuat kontrak");
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="relative">
        <button
          onClick={() => router.push("/kontrak")}
          className="absolute left-4 top-4 flex items-center text-black-600 hover:text-blue-800 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Kembali</span>
        </button>
        <CardTitle className="text-2xl font-bold text-center">
          Tambah Kontrak
        </CardTitle>
      </CardHeader>

      {serverError && (
        <Alert variant="destructive" className="mx-8 mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {serverError}
          </AlertDescription>
        </Alert>
      )}
      
      {debugInfo && (
        <div className="mx-8 mb-4 p-4 bg-gray-100 rounded-md overflow-auto">
          <h4 className="font-medium mb-2">Debug Information:</h4>
          <pre className="text-xs">{debugInfo}</pre>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="penawaran">Kode Transaksi</Label>
            <Select
              value={formData.penawaran}
              onValueChange={(val) => handleSelectChange("penawaran", val)}
            >
              <SelectTrigger className={errors.penawaran ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih kode transaksi" />
              </SelectTrigger>
              <SelectContent>
                {penawarans.length > 0 ? (
                  penawarans.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.display_label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-options" disabled>
                    Tidak ada kode transaksi tersedia
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.penawaran && (
              <p className="text-sm text-red-500">{errors.penawaran}</p>
            )}
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
                value={formData.dokumen_kontrak?.name || ""}
                placeholder="Belum ada file"
                readOnly
                className={`flex-[3] ${errors.dokumen_kontrak ? "border-red-500" : ""}`}
              />

              <input
                id="dokumen_kontrak"
                name="dokumen_kontrak"
                type="file"
                accept="application/pdf"
                onChange={handleChange}
                className="hidden"
              />

              <Button asChild className="flex-[2]">
                <label htmlFor="dokumen_kontrak" className="w-full cursor-pointer text-center">
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
            {isLoading ? "Membuat..." : "Tambah Kontrak"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}