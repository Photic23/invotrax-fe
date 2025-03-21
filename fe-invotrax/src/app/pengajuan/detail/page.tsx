'use client'

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { ButtonPengadaan } from "@/components/elements/detail/ButtonPengadaan";
import { DetailField } from "@/components/elements/detail/DetailField";
import { Title } from "@/components/elements/detail/TitlePengadaan";
import { useEffect, useState } from "react";
import Status, { DetailPengadaanStatus } from "@/components/elements/detail/Status";
import { InputField } from "@/components/elements/detail/InputField";

export default function PengajuanDetail({ detailPengajuanId } : { detailPengajuanId: number }) {
    const [status, setStatus] = useState<DetailPengadaanStatus>('diajukan'); //still hardcoded
    const [role, setRole] = useState<string>('supplier'); // still hardcoded
    const [pengadaan, setPengajuan] = useState<string>(""); // ensure this is always a string
    const searchParams = useSearchParams();
    const query = new URLSearchParams(searchParams?.toString() || "");
    const id = query.get("id");
    const [loading, setLoading] = useState<boolean>(true);

    //still error
    useEffect(() => {
        // Make sure id is a string, default to "1" if it's not available or not a string
        setPengajuan(id?.toString() || "1");
        console.log("Check", id);

        // Call fetchKelompok only if idStr is meaningful
        if(id !== "1"){
            fetchKelompok(pengadaan);
        }
    }, [id]);

    const fetchKelompok = async (id: string) => {
        setLoading(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/pengadaan-detail`, { detailPengajuanId: id });
            const detailPengajuanData = response.data;
            if (detailPengajuanData) {
                console.log("Check data", detailPengajuanData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }

    //janlup ganti type role
    const getDetailButton = (status: DetailPengadaanStatus, role: string) => {
        const combinedCondition = `${status}-${role}`;

        switch (combinedCondition) {
            //IF HARGA DIAJUKAN == NULL
            case "diajukan-pelanggan":
                return { button1: <ButtonPengadaan content="Update Harga" />, 
                        button2: <ButtonPengadaan content="Update Request" />,
                        button3: <ButtonPengadaan content="Cancel Request" />,
                        field1: <DetailField namaField="Harga yang Diajukan" isiField="-"/>,
                        field2: <div></div> };
            //IF UPDATE HARGA CLICKED
            case "diajukan-pelanggan":
                return { button1: <ButtonPengadaan content="Ajukan Harga" />, 
                        button2: <ButtonPengadaan content="Update Request" />,
                        button3: <ButtonPengadaan content="Cancel Request" />,
                        field1: <InputField namaField="Harga yang Diajukan" placeholder="0"/>,
                        field2: <div></div> };
            //IF HARGA DIAJUKAN != NULL
            case "diajukan-pelanggan":
                return { button1: <ButtonPengadaan content="Update Request" />,
                        button2: <ButtonPengadaan content="Cancel Request" />,
                        button3: <div></div>,
                        field1: <DetailField namaField="Harga yang Diajukan" isiField="Rp 150.000.000,00"/>,
                        field2: <div></div> };
            case "diproses-pelanggan":
                return { button1: <div></div>, 
                        button2: <div></div>, 
                        button3: <div></div>,
                        field1: <DetailField namaField="Harga yang Disetujui" isiField="Rp 150.000.000,00"/>,
                        field2:<DetailField namaField="Estimasi Tanggal Produk Dikirim" isiField="15 Januari, 2025"/> };
            case "dikirim-pelanggan":
                return { button1: <ButtonPengadaan content="Terima Barang" />, 
                        button2: <div></div>,
                        button3: <div></div>,
                        field1: <DetailField namaField="Harga yang Disetujui" isiField="Rp 150.000.000,00"/>,
                        field2:<DetailField namaField="Tanggal Produk Dikirim" isiField="15 Januari, 2025"/> };
            case "diterima-pelanggan":
                return { button1: <ButtonPengadaan content="Lihat Layanan Aftersales"/>, 
                        button2: <div></div>,
                        button3: <div></div>,
                        field1: <DetailField namaField="Harga yang Disetujui" isiField="Rp 150.000.000,00"/>,
                        field2:<DetailField namaField="Tanggal Produk Diterima" isiField="15 Januari, 2025"/> };
            case "ditolak-pelanggan":
                return { button1: <ButtonPengadaan content="Update Harga" />, 
                        button2: <ButtonPengadaan content="Update Request" />,
                        button3: <ButtonPengadaan content="Cancel Request" />,
                        field1: <DetailField namaField="Harga yang Diajukan" isiField="Rp 150.000.000,00"/>,
                        field2: <div></div> };
            case "diajukan-manager":
            case "diajukan-staff":
                return { button1: <ButtonPengadaan content="Setujui Request" />, 
                        button2: <ButtonPengadaan content="Tolak Request" />,
                        button3: <div></div>,
                        field1: <DetailField namaField="Harga yang Diajukan" isiField="Rp 150.000.000,00"/>,
                        field2: <InputField namaField="Estimasi Tanggal Produk Dikirim" placeholder="dd-MM-YYYY"/> };
            case "diproses-manager":
            case "diproses-staff":
                return { button1: <ButtonPengadaan content="Kirim Pesanan" />, 
                        button2: <div></div>,
                        button3: <div></div>,
                        field1: <DetailField namaField="Harga yang Disetujui" isiField="Rp 150.000.000,00"/>,
                        field2: <DetailField namaField="Estimasi Tanggal Produk Dikirim" isiField="15 Januari, 2025"/> };            
            case "dikirim-manager":
            case "dikirim-staff":
                return { button1: <div></div>, 
                        button2: <div></div>,
                        button3: <div></div>,
                        field1: <DetailField namaField="Harga yang Disetujui" isiField="Rp 150.000.000,00"/>,
                        field2: <DetailField namaField="Tanggal Produk Dikirim" isiField="15 Januari, 2025"/> };
            case "diterima-manager":
            case "diterima-staff":
                return { button1: <div></div>, 
                        button2: <div></div>,
                        button3: <div></div>,
                        field1: <DetailField namaField="Harga yang Disetujui" isiField="Rp 150.000.000,00"/>,
                        field2: <DetailField namaField="Tanggal Produk Diterima" isiField="15 Januari, 2025"/> };
            case "ditolak-manager":
            case "ditolak-staff":
                return { button1: <div></div>, 
                        button2: <div></div>,
                        button3: <div></div>,
                        field1: <DetailField namaField="Harga yang Diajukan" isiField="Rp 150.000.000,00"/>,
                        field2: <div></div> };
            default:
                return { button1: <div></div>, 
                        button2: <div></div>,
                        button3: <div></div>,
                        field1: <div></div>,
                        field2: <div></div> }; // Default case for unmatched or unexpected combinations
        }
    }

    const detailButtons = getDetailButton(status, role);

    

// TODO:
// 1. cari tau bagaimana passing id di url path di nextjs, cari tau folder structurenya seperti apa
// 2. panggil function api nya di dalam page.tsx kemudian di print isinya apa
// 3. cari tau useeffect

    return (
        <div className="px-14 content-center py-6">
            <div className="flex justify-between">
                <Title title='ABCD-001'/> 
                <Status status={status}/>
            </div>        
            <div className="py-4">
                <DetailField namaField="Nama Perusahaan" isiField="PT.SUPPLYKURSI"/>
                <DetailField namaField="Nama Produk" isiField="Kursi Kantor"/>
                <DetailField namaField="Kategori Produk" isiField="PERABOTAN"/>
                <DetailField namaField="Jumlah Produk" isiField="100"/>
                <DetailField namaField="Deskripsi Produk" isiField="Kursi Dummy Data"/>
                <DetailField namaField="URL Foto Produk" isiField="https://photic23.vercel.app/"/>
                <DetailField namaField="Harga yang Ditawarkan" isiField="Rp 150.000.000,00"/>
                {detailButtons.field1}
                {detailButtons.field2}
            </div>
            <div className="flex gap-6 pt-3">
                {detailButtons.button1}
                {detailButtons.button2}
                {detailButtons.button3}
            </div>
        </div>
    );
}