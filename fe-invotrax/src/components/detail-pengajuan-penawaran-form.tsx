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

interface PengajuanPenawaranPengadaan {
id: number;
nama_produk: string;
jumlah_produk: number;
deskripsi_produk: string;
url_foto_produk: string;
harga_diajukan: number;
// tanggal_estimasi: Date;
// tanggal_diterima_dikirim: Date;
status: string;
}

interface PengajuanPenawaranPengadaanDetailProps {
pengajuanId: number;
}

export default function PengajuanPenawaranPengadaanDetail ({ pengajuanId }: PengajuanPenawaranPengadaanDetailProps) {
const [pengajuan, setPengajuan] = useState<PengajuanPenawaranPengadaan | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [confirmOpen, setConfirmOpen] = useState(false);
const { toast } = useToast();
const router = useRouter();
const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
const { user, isLoggedIn, logout } = useAuth();
// const [formData, setFormData] = useState({
//     tanggal_estimasi: "",
// });
const [errors, setErrors] = useState<Record<string, string>>({});

useEffect(() => { fetchPengajuanDetail();}, [pengajuanId, token, toast]);

async function fetchPengajuanDetail() {
    try {
    setIsLoading(true);
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan_penawaran_pengadaan/${pengajuanId}/`,
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
        setPengajuan(data);
    } else {
        toast({
        title: "Error",
        description: "Gagal mengambil detail pengajuan",
        variant: "destructive",
        });
    }
    } catch (error) {
    console.error("Error fetching pengajuan detail:", error);
    toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengambil data pengajuan",
        variant: "destructive",
    });
    } finally {
    setIsLoading(false);
    }
}

const handleDeletePengajuan = async () => {
    try {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan_penawaran_pengadaan/${pengajuanId}/delete/`,
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
        router.push("/pengajuan_penawaran_pengadaan"); 
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
    try {
    const status = 'ditolak'

    let payload : any = {
        status: status,
    };

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan_penawaran_pengadaan/${pengajuanId}/`,
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
        description: "Pengajuan " + status,
        variant: "default",
        });
        router.push(`/pengajuan_penawaran_pengadaan/${pengajuanId}/`); // Redirect to detail page
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

const handleUpdateStatus = async () => {
    try {        
        const status = pengajuan?.status
        let newStatus = status

    if (status === 'diajukan') {
        newStatus = 'diproses'
    } else if (status === 'diproses') {
        newStatus = 'dikirim'
    } else if (status === 'dikirim') {
        newStatus = 'diterima'
    }

        let payload : any = {
        status: newStatus,
        };

    // if (pengajuan?.status === 'diajukan') {
    //     payload = {
    //     ...payload,
    //     tanggal_estimasi: pengajuan?.tanggal_estimasi
    //     }
    // } else if (pengajuan?.status === 'diproses' || pengajuan?.status === 'dikirim') {
    //     payload = {
    //     ...payload,
    //     tanggal_diterima_dikirim: Date()
    //     }
    // }

        const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan_penawaran_pengadaan/${pengajuanId}/`,
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
            description: "Pengajuan " + newStatus,
            variant: "default",
        });
        router.push(`/pengajuan_penawaran_pengadaan/${pengajuanId}/`); // Redirect to detail page
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

if (!pengajuan) {
    return <p>Pengajuan penawaran pengadaan tidak ditemukan.</p>;
}

// const formattedDate = pengajuan.tanggal_diterima_dikirim.toLocaleDateString('id-ID', {
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric'
// });

// const formattedEstimateDate = pengajuan.tanggal_estimasi.toLocaleDateString('id-ID', {
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric'
// });

const getAdditionalFields = (status: string) => {
    switch (user?.role) {
    case 'vendor':
        switch (status) {
        case 'diajukan':
            return {
            button1: 
                <Button onClick={handleUpdateStatus}>
                Setujui Request
                </Button>, 
            button2: 
                <Button onClick={handleTolak}>
                Tolak Request
                </Button>,
            field1: 
                <div>
                <Label>Harga yang Diajukan (per unit)</Label>
                <p>Rp {pengajuan.harga_diajukan.toLocaleString()}</p>
                </div>,
            field2: 
                // <div className="space-y-2">
                // <Label htmlFor="tanggal_estimasi">Estimasi Tanggal Produk Dikirim</Label>
                // <Input
                //     id="tanggal_estimasi"
                //     name="tanggal_estimasi"
                //     type="number"
                //     value= {formData.tanggal_estimasi}
                //     onChange={handleChange}
                //     placeholder="Masukkan harga produk"
                //     min="0"
                //     className={errors.harga ? "border-red-500" : ""}
                // />
                // {errors.harga && (
                //     <p className="text-sm text-red-500">{errors.harga}</p>
                // )}
                // </div>
                <div></div>,
            field3: <div></div>
            }
        case 'diproses':
            return {
            button1: 
                <Button onClick={handleUpdateStatus}>
                Kirim Pesanan
                </Button>, 
            button2: <div></div>,
            field1: 
                // <div>
                // <Label>Estimasi Tanggal Produk Dikirim</Label>
                // <p>{formattedEstimateDate}</p>
                // </div>
                <div></div>,
            field2: 
                <div>
                <Label>Harga yang Diterima (per unit)</Label>
                <p>Rp {pengajuan.harga_diajukan.toLocaleString()}</p>
                </div>,
            field3: 
                <div>
                <Label>Total Harga</Label>
                <p>Rp {(pengajuan.harga_diajukan * pengajuan.jumlah_produk).toLocaleString()}</p>
                </div>            
            }
        case 'dikirim':
            return {
            button1: <div></div>, 
            button2: <div></div>,
            field1: 
                // <div>
                // <Label>Tanggal Produk Dikirim</Label>
                // <p>{formattedDate}</p>
                // </div>
                <div></div>,
            field2: 
                <div>
                <Label>Harga yang Diterima (per unit)</Label>
                <p>Rp {pengajuan.harga_diajukan.toLocaleString()}</p>
                </div>,
            field3: 
                <div>
                <Label>Total Harga</Label>
                <p>Rp {(pengajuan.harga_diajukan * pengajuan.jumlah_produk).toLocaleString()}</p>
                </div>
            }
        case 'diterima':
            return {
            button1: <div></div>, 
            button2: <div></div>,
            field1: 
                // <div>
                // <Label>Tanggal Produk Diterima</Label>
                // <p>{formattedDate}</p>
                // </div>
                <div></div>,
            field2: 
                <div>
                <Label>Harga yang Diterima (per unit)</Label>
                <p>Rp {pengajuan.harga_diajukan.toLocaleString()}</p>
                </div>,
            field3: 
                <div>
                <Label>Total Harga</Label>
                <p>Rp {(pengajuan.harga_diajukan * pengajuan.jumlah_produk).toLocaleString()}</p>
                </div>
            }
        case 'ditolak':
            return {
            button1: <div></div>, 
            button2: <div></div>,
            field1: 
                <div>
                <Label>Harga yang Diajukan (per unit)</Label>
                <p>Rp {pengajuan.harga_diajukan.toLocaleString()}</p>
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
                <Button onClick={() => router.push(`/${pengajuanId}/update`)}>
                    Ubah Request
                </Button>, 
            button2: 
                <Button variant="destructive" onClick={handleDeletePengajuan}>
                    Cancel Request
                </Button>, 
            field1: 
                <div>
                    <Label>Harga yang Diajukan (per unit)</Label>
                    <p>Rp {pengajuan.harga_diajukan.toLocaleString()}</p>
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
                //     <Label>Estimasi Tanggal Produk Dikirim</Label>
                //     <p>{formattedEstimateDate}</p>
                // </div>
                <div></div>,
            field2: 
                <div>
                    <Label>Harga yang Diterima (per unit)</Label>
                    <p>Rp {pengajuan.harga_diajukan.toLocaleString()}</p>
                </div>,
            field3: 
                <div>
                    <Label>Total Harga</Label>
                    <p>Rp {(pengajuan.harga_diajukan * pengajuan.jumlah_produk).toLocaleString()}</p>
                </div>
        }
        case 'dikirim':
        return {
            button1: 
                <Button onClick={handleUpdateStatus}>
                    Terima Pesanan
                </Button>, 
            button2: <div></div>,
            field1: 
                // <div>
                //     <Label>Tanggal Produk Dikirim</Label>
                //     <p>{formattedDate}</p>
                // </div>
                <div></div>,
            field2: 
                <div>
                    <Label>Harga yang Diterima (per unit)</Label>
                    <p>Rp {pengajuan.harga_diajukan.toLocaleString()}</p>
                </div>,
            field3: 
                <div>
                    <Label>Total Harga</Label>
                    <p>Rp {(pengajuan.harga_diajukan * pengajuan.jumlah_produk).toLocaleString()}</p>
                </div>
        }
        case 'diterima':
        return {
            button1: <div></div>, 
            button2: <div></div>,
            field1: 
                // <div>
                //     <Label>Tanggal Produk Diterima</Label>
                //     <p>{formattedDate}</p>
                // </div>
                <div></div>,
            field2: 
                <div>
                    <Label>Harga yang Diterima (per unit)</Label>
                    <p>Rp {pengajuan.harga_diajukan.toLocaleString()}</p>
                </div>,
            field3: 
                <div>
                    <Label>Total Harga</Label>
                    <p>Rp {(pengajuan.harga_diajukan * pengajuan.jumlah_produk).toLocaleString()}</p>
                </div>
        }
        case 'ditolak':
        return {
            button1: 
                <Button onClick={() => router.push(`/${pengajuanId}/update`)}>
                    Ubah Request
                </Button>, 
            button2: 
                <Button variant="destructive" onClick={handleDeletePengajuan}>
                    Cancel Request
                </Button>,
            field1: 
                <div>
                    <Label>Harga yang Diajukan (per unit)</Label>
                    <p>Rp {pengajuan.harga_diajukan.toLocaleString()}</p>
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
        onClick={() => router.push("/pengajuan_penawaran_pengadaan")}
        className="absolute left-4 top-4 flex items-center text-gray-600 hover:text-blue-800 transition"
        >
        <ArrowLeft className="w-5 h-5 mr-2" />
        <span>Kembali</span>
        </button>
        <CardTitle className="text-2xl font-bold text-center">
        Request pengajuan Supply {pengajuan.nama_produk}
        </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
        {/* <div>
        <Label>Nama Perusahaan</Label>
        <p>{pengajuan.nama_produk}</p>
        </div> */}
        <div>
        <Label>Nama Produk</Label>
        <p>{pengajuan.nama_produk}</p>
        </div>
        {/* <div>
        <Label>Kategori Produk</Label>
        <p>{pengajuan.kategori_produk.nama}</p>
        </div> */}
        <div>
        <Label>Jumlah Stok</Label>
        <p>{pengajuan.jumlah_produk}</p>
        </div>
        <div>
        <Label>Deskripsi Produk</Label>
        <p>{pengajuan.deskripsi_produk}</p>
        </div>
        <div>
        <Label>URL Foto Produk</Label>
        <p>{pengajuan.url_foto_produk}</p>
        </div>
        {getAdditionalFields(pengajuan.status)?.field1}
        {getAdditionalFields(pengajuan.status)?.field2}
        {getAdditionalFields(pengajuan.status)?.field3}
    </CardContent>
    <CardFooter className="flex justify-between">
        {/* <Button onClick={() => router.push(`/${pengajuanId}/update`)}>
        Ubah Request
        </Button>
        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
        Cancel Request
        </Button> */}
        {getAdditionalFields(pengajuan.status)?.button1}
        {getAdditionalFields(pengajuan.status)?.button2}
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
            <Button variant="destructive" onClick={handleDeletePengajuan}>
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
