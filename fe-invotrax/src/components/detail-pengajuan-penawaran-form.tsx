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
import Status, { DetailPengadaanStatus } from "./elements/detail/Status";
import { Input } from "./ui/input";
import WarrantyStatus from "./elements/detail/WarrantyStatus";
import RatingStatus from "./elements/detail/RatingStatus";

interface PengajuanPenawaranPengadaan {
id: number;
supplier_vendor: { id: number; company_name: string };
nama_produk: string;
kategori_produk: { id: number; nama: string };
jumlah_produk: number;
deskripsi_produk: string;
url_foto_produk: string;
harga_diajukan: number;
tanggal_estimasi: Date;
tanggal_diterima_dikirim: Date;
status: string;
status_garansi: string;
tanggal_garansi: Date;
}

interface Penilaian {
    rating: number;
}

interface PengajuanPenawaranPengadaanDetailProps {
pengajuanId: number;
}

export default function PengajuanPenawaranPengadaanDetail ({ pengajuanId }: PengajuanPenawaranPengadaanDetailProps) {
    const [pengajuan, setPengajuan] = useState<PengajuanPenawaranPengadaan | null>(null);
    const [penilaian, setPenilaian] = useState<Penilaian | null>(null);
    const [exchangeExists, setExchangeExists] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const { user, isLoggedIn, logout } = useAuth();
    const [formData, setFormData] = useState({
        tanggal_estimasi: new Date().toISOString().split('T')[0], // 'YYYY-MM-DD'
    });  
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => { fetchPengajuanDetail(); fetchPenilaian(); fetchExchange();}, [pengajuanId, token, toast]);

    async function fetchPengajuanDetail() {
        try {
            setIsLoading(true);
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

    const fetchPenilaian = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/rating/by_pengajuan/${pengajuanId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 204) {
                // penilaian doesn't exist yet
                setPenilaian(null);
                return;
            }

            if (!response.ok) throw new Error("Failed to fetch penilaian");

            const text = await response.text();

            if (!text) {
                // no JSON body
                setPenilaian(null);
                return;
            }

            const data = JSON.parse(text);
            setPenilaian(data);
        } catch (error) {
            console.error("Error fetching penilaian:", error);
            setPenilaian(null); // Fallback
            // toast can be optional if the error is not critical
        }
    };

    const fetchExchange = async () => {
        try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/layanan_pasca_beli/exchange-request/by_pengajuan/${pengajuanId}/`, {
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            },
        });
    
        if (response.ok) {
            const text = await response.text();
            console.log("Exchange response:", response.status, text);

            if (text) {
            setExchangeExists(true);
            } else {
            setExchangeExists(false);
            }
        } else if (response.status === 404 || response.status === 204) {
            setExchangeExists(false);
        } else {
            throw new Error("Failed to fetch exchange");
        }
        } catch (error) {
        console.error("Error fetching exchange:", error);
        setExchangeExists(false); // fallback
        }
    };
    
    const handleDeletePengajuan = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan/pengajuan_penawaran_pengadaan/${pengajuanId}/`,
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
                router.push(`/pengajuan_penawaran_pengadaan`); 
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
        setFormData((prev) => ({ ...prev, [name]: value }));
        
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
            const payload = {
                status: 'ditolak'
            };

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan/pengajuan_penawaran_pengadaan/${pengajuanId}/`,
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
                setPengajuan(prev => prev ? {...prev, status: 'ditolak'} : null);
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

    const handleUpdateStatus = async (newStatus: string) => {
        if (!pengajuan) return;
        try {    
            type updatePayload = {
                status: string;
                tanggal_estimasi?: string;
                tanggal_diterima_dikirim?: string;
            };    
            let payload: updatePayload = {
                status: newStatus
            };

            if (pengajuan?.status === 'diajukan') {
                payload = {
                ...payload,
                tanggal_estimasi: formData.tanggal_estimasi
                }
            } else if (pengajuan?.status === 'diproses' || pengajuan?.status === 'dikirim') {
                payload = {
                ...payload,
                tanggal_diterima_dikirim: new Date().toISOString().split("T")[0],
                }
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan/pengajuan_penawaran_pengadaan/${pengajuanId}/`,
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
                setPengajuan({...pengajuan, status: newStatus})
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

    const formattedDate = pengajuan.tanggal_diterima_dikirim
        ? new Date(pengajuan.tanggal_diterima_dikirim).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) : '-';

    const formattedEstimateDate = pengajuan.tanggal_estimasi
        ? new Date(pengajuan.tanggal_estimasi).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) : '-';

    const formattedWarrantyDate = pengajuan.tanggal_garansi
        ? new Date(pengajuan.tanggal_garansi).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) : '-';

    const formatHarga = (value: string | number) =>
        Number(value).toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 2,
        });

    const getAdditionalFields = (status: string) => {
        switch (user?.role) {
        case 'staff':
            switch (status) {
            case 'diajukan':
                return {
                status:
                    <Status status={pengajuan.status}/>,
                button1: 
                    <Button onClick={() => handleUpdateStatus('diproses')} disabled={isLoading}>
                    Setujui Request
                    </Button>, 
                button2: 
                    <Button onClick={handleTolak} disabled={isLoading}>
                    Tolak Request
                    </Button>,
                field1: 
                    <div>
                        <Label>Harga yang Diajukan (per unit)</Label>
                        <p>{formatHarga(pengajuan.harga_diajukan)}</p>
                    </div>,
                field2: 
                    <div className="space-y-2">
                        <Label htmlFor="tanggal_estimasi">Estimasi Tanggal Produk Dikirim</Label>
                        <Input
                            id="tanggal_estimasi"
                            name="tanggal_estimasi"
                            type="date"
                            value= {
                                formData.tanggal_estimasi
                                    ? new Date(formData.tanggal_estimasi).toISOString().split('T')[0]
                                    : ''
                                }  
                            onChange={handleChange}
                            placeholder="Masukkan estimasi tanggal pengiriman produk"
                            min="0"
                            className={errors.harga ? "border-red-500" : ""}
                        />
                        {errors.harga && (
                            <p className="text-sm text-red-500">{errors.harga}</p>
                        )}
                    </div>,
                field3: <div></div>,
                field4:<div></div>
                }
            case 'diproses':
                return {
                status:
                    <Status status={pengajuan.status}/>,
                button1: 
                    <Button onClick={() => handleUpdateStatus('dikirim')} disabled={isLoading}>
                    Kirim Pesanan
                    </Button>, 
                button2: <div></div>,
                field1: 
                    <div>
                        <Label>Estimasi Tanggal Produk Dikirim</Label>
                        <p>{formattedEstimateDate}</p>
                    </div>,
                field2: 
                    <div>
                        <Label>Harga yang Diterima (per unit)</Label>
                        <p>{formatHarga(pengajuan.harga_diajukan)}</p>
                    </div>,
                field3: 
                    <div>
                        <Label>Total Harga</Label>
                        <p>{formatHarga(pengajuan.harga_diajukan * pengajuan.jumlah_produk)}</p>
                    </div>,
                field4:<div></div>            
                }
            case 'dikirim':
                return {
                status:
                    <Status status={pengajuan.status}/>,
                button1: <div></div>, 
                button2: <div></div>,
                field1: 
                    <div>
                        <Label>Tanggal Produk Dikirim</Label>
                        <p>{formattedDate}</p>
                    </div>,
                field2: 
                    <div>
                        <Label>Harga yang Diterima (per unit)</Label>
                        <p>{formatHarga(pengajuan.harga_diajukan)}</p>
                    </div>,
                field3: 
                    <div>
                        <Label>Total Harga</Label>
                        <p>{formatHarga(pengajuan.harga_diajukan * pengajuan.jumlah_produk)}</p>     
                    </div>,
                field4:<div></div>
                }
            case 'diterima':
                return {
                rating:
                    <RatingStatus rating={penilaian?.rating ?? 0} />,
                warrantystatus:
                    <WarrantyStatus warranty_status={pengajuan.status_garansi}/>,
                status:
                    <Status status={pengajuan.status}/>,
                field1: 
                    <div>
                        <Label>Tanggal Produk Diterima</Label>
                        <p>{formattedDate}</p>
                    </div>,
                field2: 
                    <div>
                        <Label>Harga yang Diterima (per unit)</Label>
                        <p>{formatHarga(pengajuan.harga_diajukan)}</p>
                    </div>,
                field3: 
                    <div>
                        <Label>Total Harga</Label>
                        <p>{formatHarga(pengajuan.harga_diajukan * pengajuan.jumlah_produk)}</p>
                    </div>,
                field4:
                    <div>
                        <Label>Tanggal Garansi Berakhir</Label>
                        <p>{formattedWarrantyDate}</p>
                    </div>
                }
            case 'ditolak':
                return {
                status:
                    <Status status={pengajuan.status}/>,
                button1: <div></div>, 
                button2: <div></div>,
                field1: 
                    <div>
                        <Label>Harga yang Diajukan (per unit)</Label>
                        <p>{formatHarga(pengajuan.harga_diajukan)}</p>
                    </div>,
                field2: <div></div>,
                field3: <div></div>,
                field4:<div></div>
                }
            }
        case 'customer':
        //case 'manager':
        switch (status) {
            case 'diajukan':
            return {
                status:
                    <Status status={pengajuan.status}/>,
                button1: 
                    <Button onClick={() => router.push(`/pengajuan_penawaran_pengadaan/${pengajuanId}/update`)} disabled={isLoading}>
                        Ubah Request
                    </Button>, 
                button2: 
                    <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                        Cancel Request
                    </Button>, 
                field1: 
                    <div>
                        <Label>Harga yang Diajukan (per unit)</Label>
                        <p>{formatHarga(pengajuan.harga_diajukan)}</p>
                    </div>,
                field2: <div></div>,
                field3: <div></div>,
                field4:<div></div>
            }
            case 'diproses':
            return {
                status:
                    <Status status={pengajuan.status}/>,
                button1: <div></div>, 
                button2: <div></div>, 
                field1:
                    <div>
                        <Label>Estimasi Tanggal Produk Dikirim</Label>
                        <p>{formattedEstimateDate}</p>
                    </div>,
                field2: 
                    <div>
                        <Label>Harga yang Diterima (per unit)</Label>
                        <p>{formatHarga(pengajuan.harga_diajukan)}</p>
                    </div>,
                field3: 
                    <div>
                        <Label>Total Harga</Label>
                        <p>{formatHarga(pengajuan.harga_diajukan * pengajuan.jumlah_produk)}</p>
                    </div>,
                field4:<div></div>
            }
            case 'dikirim':
            return {
                status:
                    <Status status={pengajuan.status}/>,
                button1: 
                    <Button onClick={() => handleUpdateStatus('diterima')} disabled={isLoading}>
                        Terima Pesanan
                    </Button>, 
                button2: <div></div>,
                field1: 
                    <div>
                        <Label>Tanggal Produk Dikirim</Label>
                        <p>{formattedDate}</p>
                    </div>,
                field2: 
                    <div>
                        <Label>Harga yang Diterima (per unit)</Label>
                        <p>{formatHarga(pengajuan.harga_diajukan)}</p>
                    </div>,
                field3: 
                    <div>
                        <Label>Total Harga</Label>
                        <p>{formatHarga(pengajuan.harga_diajukan * pengajuan.jumlah_produk)}</p>
                    </div>,
                field4:<div></div>
            }
            case 'diterima':
            const isWarrantyValid = pengajuan.status_garansi === 'Berlaku';
            return {
                rating:
                <RatingStatus rating={penilaian?.rating ?? 0} />,
                warrantystatus:
                    <WarrantyStatus warranty_status={pengajuan.status_garansi}/>,
                status:
                    <Status status={pengajuan.status}/>,
                button1: (
                    !exchangeExists && !penilaian ? (
                    <div className="flex gap-4 mt-1.5">
                        {isWarrantyValid && (
                        <Button onClick={() => router.push(`/exchange/create/${pengajuan.id}`)}>
                            Create Exchange Request
                        </Button>
                        )}
                        <Button onClick={() => router.push(`/penilaian/${pengajuan.id}`)}>
                        Buat Penilaian
                        </Button>
                    </div>
                    ) : !exchangeExists && isWarrantyValid ? (
                    <Button onClick={() => router.push(`/exchange/create/${pengajuan.id}`)}>
                        Create Exchange Request
                    </Button>
                    ) : !penilaian ? (
                    <Button onClick={() => router.push(`/penilaian/${pengajuan.id}`)}>
                        Buat Penilaian
                    </Button>
                    ) : (
                    <div className="italic text-sm text-muted-foreground">
                        Exchange request dan penilaian untuk pengajuan ini sudah dibuat.
                    </div>
                    )
                ),
                button2: <div></div>,
                field1: 
                    <div>
                        <Label>Tanggal Produk Diterima</Label>
                        <p>{formattedDate}</p>
                    </div>,
                field2: 
                    <div>
                        <Label>Harga yang Diterima (per unit)</Label>
                        <p>{formatHarga(pengajuan.harga_diajukan)}</p>
                    </div>,
                field3: 
                    <div>
                        <Label>Total Harga</Label>
                        <p>{formatHarga(pengajuan.harga_diajukan * pengajuan.jumlah_produk)}</p>
                    </div>,
                field4:
                    <div>
                        <Label>Tanggal Garansi Berakhir</Label>
                        <p>{formattedWarrantyDate}</p>
                    </div>
            }
            case 'ditolak':
            return {
                status:
                    <Status status={pengajuan.status}/>,
                button1: 
                    <Button onClick={() => router.push(`/pengajuan_penawaran_pengadaan/${pengajuanId}/update`)} disabled={isLoading}>
                        Ubah Request
                    </Button>, 
                button2: 
                    <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                        Cancel Request
                    </Button>,
                field1: 
                    <div>
                        <Label>Harga yang Diajukan (per unit)</Label>
                        <p>{formatHarga(pengajuan.harga_diajukan)}</p>
                    </div>,
                field2: <div></div>,
                field3: <div></div>,
                field4:<div></div>
            }
        }
        default:
            return
        }
    }

    return (
        <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex-row justify-between items-center mx-2 my-2">
            <button
            onClick={() => router.push(`/pengajuan_penawaran_pengadaan`)}
            className="flex items-center text-gray-600 hover:text-blue-800 transition"
            >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Kembali</span>
            </button>
            <CardTitle className="text-2xl font-bold text-center">
            Request Pengajuan {pengajuan.nama_produk}
            </CardTitle>
            <div className="pr-1 flex flex-row space-x-4">
                {getAdditionalFields(pengajuan.status)?.status}
                {getAdditionalFields(pengajuan.status)?.warrantystatus}
                {getAdditionalFields(pengajuan.status)?.rating}
            </div>
        </CardHeader>
        <CardContent className="space-y-4 mx-2">
            <div>
            <Label>Nama Supplier</Label>
            <p>{pengajuan.supplier_vendor.company_name}</p>
            </div>
            <div>
            <Label>Nama Produk</Label>
            <p>{pengajuan.nama_produk}</p>
            </div>
            <div>
            <Label>Kategori Produk</Label>
            <p>{pengajuan.kategori_produk.nama}</p>
            </div>
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
            <p>
                <a 
                    href={pengajuan.url_foto_produk}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-800 hover:underline break-all"
                >
                    {pengajuan.url_foto_produk}
                </a>
            </p>
            </div>
            {getAdditionalFields(pengajuan.status)?.field1}
            {getAdditionalFields(pengajuan.status)?.field2}
            {getAdditionalFields(pengajuan.status)?.field3}
            {getAdditionalFields(pengajuan.status)?.field4}
        </CardContent>
        <CardFooter className="flex mx-2 gap-4 mb-5">
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
                Hapus
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
