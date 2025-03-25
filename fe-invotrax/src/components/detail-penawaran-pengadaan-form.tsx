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
import { DetailPengadaanStatus } from "./elements/detail/Status";
import { Input } from "./ui/input";

interface PenawaranPengadaan {
  id: number;
  supplier_vendor: { id: number; company_name: string };
  nama_produk: string;
  kategori_produk: { id: number; nama: string };
  jumlah_produk: number;
  deskripsi_produk: string;
  url_foto_produk: string;
  harga_diajukan: number;
  // tanggal_estimasi: Date;
  // tanggal_diterima_dikirim: Date;
  status: string;
}

interface PenawaranPengadaanDetailProps {
  pengadaanId: number;
}

export default function PenawaranPengadaanDetail ({ pengadaanId }: PenawaranPengadaanDetailProps) {
  const [pengadaan, setPengadaan] = useState<PenawaranPengadaan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const { user, isLoggedIn, logout } = useAuth();
  // const [formData, setFormData] = useState({
  //   tanggal_estimasi: "",
  // });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { fetchPengadaanDetail();}, [pengadaanId, token, toast]);

  async function fetchPengadaanDetail() {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/penawaran-pengadaan/${pengadaanId}/`,
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
        setPengadaan(data);
      } else {
        toast({
          title: "Error",
          description: "Gagal mengambil detail pengadaan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching pengadaan detail:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengambil data pengadaan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeletePengadaan = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/penawaran-pengadaan/${pengadaanId}/delete/`,
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
          description: "Request berhasil dihapus",
          variant: "default",
        });
        router.push("/penawaran-pengadaan"); 
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: "Gagal menghapus request",
          variant: "destructive",
        });
        console.error("Delete error:", errorData);
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus request",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleTolak = async () => {
    setIsLoading(true);
    try {
      const payload : any = {
        status: 'ditolak',
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/penawaran-pengadaan/${pengadaanId}//`,
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
        setPengadaan(prev => prev ? {...prev, status: 'ditolak'} : null);
        toast({
          title: "Sukses",
          description: "Pengadaan " + status,
          variant: "default",
        });
        router.push(`/penawaran-pengadaan/${pengadaanId}/`); // Redirect to detail page
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: "Gagal memproses request",
          variant: "destructive",
        });
        console.error("API error:", errorData);
      }
    } catch (error) {
      console.error("Error processing request:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memproses request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!pengadaan) return;
    try {        
      const payload = {
        status: newStatus,
      };

    // if (pengadaan?.status === 'diajukan') {
    //   payload = {
    //     ...payload,
    //     tanggal_estimasi: pengadaan?.tanggal_estimasi
    //   }
    // } else if (pengadaan?.status === 'diproses' || pengadaan?.status === 'dikirim') {
    //   payload = {
    //     ...payload,
    //     tanggal_diterima_dikirim: Date()
    //   }
    // }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/penawaran-pengadaan/${pengadaanId}/`,
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
        setPengadaan({...pengadaan, status: newStatus});
        toast({
          title: "Sukses",
          description: "Pengadaan " + newStatus,
          variant: "default",
        });
        router.push(`/penawaran-pengadaan/${pengadaanId}/`); // Redirect to detail page
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: "Gagal memproses request",
          variant: "destructive",
        });
        console.error("API error:", errorData);
      }
    } catch (error) {
      console.error("Error processing request:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memproses request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!pengadaan) {
    return <p>Penawaran pengadaan tidak ditemukan.</p>;
  }

  // const formattedDate = pengadaan.tanggal_diterima_dikirim.toLocaleDateString('id-ID', {
  //   day: 'numeric',
  //   month: 'long',
  //   year: 'numeric'
  // });

  // const formattedEstimateDate = pengadaan.tanggal_estimasi.toLocaleDateString('id-ID', {
  //   day: 'numeric',
  //   month: 'long',
  //   year: 'numeric'
  // });

  const getAdditionalFields = (status: string) => {
    switch (user?.role) {
      case 'vendor':
        switch (status) {
          case 'diajukan':
            return {
              button1: 
                <Button onClick={() => handleUpdateStatus('diproses')}>
                  Setujui Request
                </Button>, 
              button2: 
                <Button onClick={() => handleTolak}>
                  Tolak Request
                </Button>,
              field1: 
                <div>
                  <Label>Harga yang Diajukan (per unit)</Label>
                  <p>Rp {pengadaan.harga_diajukan.toLocaleString()}</p>
                </div>,
              field2: 
                // <div className="space-y-2">
                //   <Label htmlFor="tanggal_estimasi">Estimasi Tanggal Produk Dikirim</Label>
                //   <Input
                //     id="tanggal_estimasi"
                //     name="tanggal_estimasi"
                //     type="number"
                //     value= {formData.tanggal_estimasi}
                //     onChange={handleChange}
                //     placeholder="Masukkan harga produk"
                //     min="0"
                //     className={errors.harga ? "border-red-500" : ""}
                //   />
                //   {errors.harga && (
                //     <p className="text-sm text-red-500">{errors.harga}</p>
                //   )}
                // </div>
                <div></div>,
              field3: <div></div>
            }
          case 'diproses':
            return {
              button1: 
                <Button onClick={() => handleUpdateStatus('dikirim')}>
                  Kirim Pesanan
                </Button>, 
              button2: <div></div>,
              field1: 
                // <div>
                //   <Label>Estimasi Tanggal Produk Dikirim</Label>
                //   <p>{formattedEstimateDate}</p>
                // </div>
                <div></div>,
              field2: 
                <div>
                  <Label>Harga yang Diterima (per unit)</Label>
                  <p>Rp {pengadaan.harga_diajukan.toLocaleString()}</p>
                </div>,
              field3: 
                <div>
                  <Label>Total Harga</Label>
                  <p>Rp {(pengadaan.harga_diajukan * pengadaan.jumlah_produk).toLocaleString()}</p>
                </div>            
            }
          case 'dikirim':
            return {
              button1: <div></div>, 
              button2: <div></div>,
              field1: 
                // <div>
                //   <Label>Tanggal Produk Dikirim</Label>
                //   <p>{formattedDate}</p>
                // </div>
                <div></div>,
              field2: 
                <div>
                  <Label>Harga yang Diterima (per unit)</Label>
                  <p>Rp {pengadaan.harga_diajukan.toLocaleString()}</p>
                </div>,
              field3: 
                <div>
                  <Label>Total Harga</Label>
                  <p>Rp {(pengadaan.harga_diajukan * pengadaan.jumlah_produk).toLocaleString()}</p>
                </div>
            }
          case 'diterima':
            return {
              button1: <div></div>, 
              button2: <div></div>,
              field1: 
                // <div>
                //   <Label>Tanggal Produk Diterima</Label>
                //   <p>{formattedDate}</p>
                // </div>
                <div></div>,
              field2: 
                <div>
                  <Label>Harga yang Diterima (per unit)</Label>
                  <p>Rp {pengadaan.harga_diajukan.toLocaleString()}</p>
                </div>,
              field3: 
                <div>
                  <Label>Total Harga</Label>
                  <p>Rp {(pengadaan.harga_diajukan * pengadaan.jumlah_produk).toLocaleString()}</p>
                </div>
            }
          case 'ditolak':
            return {
              button1: <div></div>, 
              button2: <div></div>,
              field1: 
                <div>
                  <Label>Harga yang Diajukan (per unit)</Label>
                  <p>Rp {pengadaan.harga_diajukan.toLocaleString()}</p>
                </div>,
              field2: <div></div>,
              field3: <div></div>
            }
        }
      case 'staff':
      //case 'manager':
      switch (status) {
        case 'diajukan':
          return {
            button1: 
              <Button onClick={() => router.push(`/${pengadaanId}/update`)}>
                Ubah Request
              </Button>, 
            button2: 
              <Button variant="destructive" onClick={handleDeletePengadaan}>
                Cancel Request
              </Button>, 
            field1: 
              <div>
                <Label>Harga yang Diajukan (per unit)</Label>
                <p>Rp {pengadaan.harga_diajukan.toLocaleString()}</p>
              </div>,
            field2: <div></div>,
            field3: <div></div>
          }
        case 'diproses':
          return {
            button1: <div></div>, 
            button2: <div></div>, 
            field1:
              // <div>
              //   <Label>Estimasi Tanggal Produk Dikirim</Label>
              //   <p>{formattedEstimateDate}</p>
              // </div>
              <div></div>,
            field2: 
              <div>
                <Label>Harga yang Diterima (per unit)</Label>
                <p>Rp {pengadaan.harga_diajukan.toLocaleString()}</p>
              </div>,
            field3: 
              <div>
                <Label>Total Harga</Label>
                <p>Rp {(pengadaan.harga_diajukan * pengadaan.jumlah_produk).toLocaleString()}</p>
              </div>
          }
        case 'dikirim':
          return {
            button1: 
              <Button onClick={() => handleUpdateStatus('diterima')}>
                Terima Pesanan
              </Button>, 
            button2: <div></div>,
            field1: 
              // <div>
              //   <Label>Tanggal Produk Dikirim</Label>
              //   <p>{formattedDate}</p>
              // </div>
              <div></div>,
            field2: 
              <div>
                <Label>Harga yang Diterima (per unit)</Label>
                <p>Rp {pengadaan.harga_diajukan.toLocaleString()}</p>
              </div>,
            field3: 
              <div>
                <Label>Total Harga</Label>
                <p>Rp {(pengadaan.harga_diajukan * pengadaan.jumlah_produk).toLocaleString()}</p>
              </div>
          }
        case 'diterima':
          return {
            button1: <div></div>, 
            button2: <div></div>,
            field1: 
              // <div>
              //   <Label>Tanggal Produk Diterima</Label>
              //   <p>{formattedDate}</p>
              // </div>
              <div></div>,
            field2: 
              <div>
                <Label>Harga yang Diterima (per unit)</Label>
                <p>Rp {pengadaan.harga_diajukan.toLocaleString()}</p>
              </div>,
            field3: 
              <div>
                <Label>Total Harga</Label>
                <p>Rp {(pengadaan.harga_diajukan * pengadaan.jumlah_produk).toLocaleString()}</p>
              </div>
          }
        case 'ditolak':
          return {
            button1: 
              <Button onClick={() => router.push(`/${pengadaanId}/update`)}>
                Ubah Request
              </Button>, 
            button2: 
              <Button variant="destructive" onClick={handleDeletePengadaan}>
                Cancel Request
              </Button>,
            field1: 
              <div>
                <Label>Harga yang Diajukan (per unit)</Label>
                <p>Rp {pengadaan.harga_diajukan.toLocaleString()}</p>
              </div>,
            field2: <div></div>,
            field3: <div></div>
          }
      }
      default:
        return
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="relative">
        <button
          onClick={() => router.push("/penawaran-pengadaan")}
          className="absolute left-4 top-4 flex items-center text-gray-600 hover:text-blue-800 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Kembali</span>
        </button>
        <CardTitle className="text-2xl font-bold text-center">
          Request Pengadaan Supply {pengadaan.nama_produk}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Nama Supplier</Label>
          <p>{pengadaan.supplier_vendor.company_name}</p>
        </div>
        <div>
          <Label>Nama Produk</Label>
          <p>{pengadaan.nama_produk}</p>
        </div>
        <div>
          <Label>Kategori Produk</Label>
          <p>{pengadaan.kategori_produk.nama}</p>
        </div>
        <div>
          <Label>Jumlah Stok</Label>
          <p>{pengadaan.jumlah_produk}</p>
        </div>
        <div>
          <Label>Deskripsi Produk</Label>
          <p>{pengadaan.deskripsi_produk}</p>
        </div>
        <div>
          <Label>URL Foto Produk</Label>
          <p>{pengadaan.url_foto_produk}</p>
        </div>
        {getAdditionalFields(pengadaan.status)?.field1}
        {getAdditionalFields(pengadaan.status)?.field2}
        {getAdditionalFields(pengadaan.status)?.field3}
      </CardContent>
      <CardFooter className="flex justify-between">
        {/* <Button onClick={() => router.push(`/${pengadaanId}/update`)}>
          Ubah Request
        </Button>
        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
          Cancel Request
        </Button> */}
        {getAdditionalFields(pengadaan.status)?.button1}
        {getAdditionalFields(pengadaan.status)?.button2}
      </CardFooter>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p className="mb-4">Apakah Anda yakin ingin menghapus request ini?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeletePengadaan}>
              Hapus Produk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function elif(arg0: boolean) {
  throw new Error("Function not implemented.");
}
