'use client'

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { ButtonPengadaan } from "../../../../components/elements/detail/ButtonPengadaan";
import { DetailField } from "../../../../components/elements/detail/DetailField";
import { Title } from "../../../../components/elements/detail/TitlePengadaan";
import { useEffect, useState } from "react";
import Status, { DetailPengadaanStatus } from "@/components/elements/detail/Status";
import { InputField } from "@/components/elements/detail/InputField";

export default function PengadaanDetail() {
    const [status, setStatus] = useState<DetailPengadaanStatus>('diajukan');
    const [role, setRole] = useState<string>('supplier'); // Later change if role permission is added
    const [pengadaan, setPengadaan] = useState<string>(""); // Ensure this is always a string
    const searchParams = useSearchParams();
    const query = new URLSearchParams(searchParams?.toString() || "");
    const id = query.get("id");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Make sure id is a string, default to "1" if it's not available or not a string
        setPengadaan(id?.toString() || "1");
        console.log("Check", id);

        // Call fetchKelompok only if idStr is meaningful
        if(id !== "1"){
            fetchKelompok(pengadaan);
        }
    }, [id]);

    const fetchKelompok = async (id: string) => {
        setLoading(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/pengadaan-detail`, { detailPengadaanId: id });
            const detailPengadaanData = response.data;
            if (detailPengadaanData) {
                console.log("Check data", detailPengadaanData);
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
            case "diajukan-vendor":
                return { button1: <ButtonPengadaan content="Ubah Request" />, 
                        button2: <ButtonPengadaan content="Cancel Request" />, 
                        field1: <DetailField namaField="Harga yang Diajukan (per unit)" isiField="Rp 1.000.000,00"/>,
                        field2: <div></div>,
                        field3: <div></div> };
            case "diproses-vendor":
                return { button1: <div></div>, 
                        button2: <div></div>, 
                        field1:<DetailField namaField="Estimasi Tanggal Produk Dikirim" isiField="15 Januari, 2025"/>,
                        field2: <DetailField namaField="Harga yang Diterima (per unit)" isiField="Rp 1.000.000,00"/>,
                        field3: <DetailField namaField="Total Harga" isiField="Rp 100.000.000,00"/> };
            case "dikirim-vendor":
                return { button1: <ButtonPengadaan content="Terima Pesanan" />, 
                        button2: <div></div>,
                        field1: <DetailField namaField="Tanggal Produk Dikirim" isiField="15 Januari, 2025"/>,
                        field2: <DetailField namaField="Harga yang Diterima (per unit)" isiField="Rp 1.000.000,00"/>,
                        field3: <DetailField namaField="Total Harga" isiField="Rp 100.000.000,00"/> };
            case "diterima-vendor":
                return { button1: <div></div>, 
                        button2: <div></div>,
                        field1: <DetailField namaField="Tanggal Produk Diterima" isiField="15 Januari, 2025"/>,
                        field2: <DetailField namaField="Harga yang Diterima (per unit)" isiField="Rp 1.000.000,00"/>,
                        field3: <DetailField namaField="Total Harga" isiField="Rp 100.000.000,00"/> };
            case "ditolak-vendor":
                return { button1: <ButtonPengadaan content="Ubah Request" />, 
                        button2: <ButtonPengadaan content="Cancel Request" />,
                        field1: <DetailField namaField="Harga yang Diajukan (per unit)" isiField="Rp 1.000.000,00"/>,
                        field2: <div></div>,
                        field3: <div></div> };
            case "diajukan-supplier":
                return { button1: <ButtonPengadaan content="Setujui Request" />, 
                        button2: <ButtonPengadaan content="Tolak Request" />,
                        field1: <DetailField namaField="Harga yang Diajukan (per unit)" isiField="Rp 1.000.000,00"/>,
                        field2: <InputField namaField="Estimasi Tanggal Produk Dikirim" placeholder="dd-MM-YYYY"/>,
                        field3: <div></div> };
            case "diproses-supplier":
                return { button1: <ButtonPengadaan content="Kirim Pesanan" />, 
                        button2: <div></div>,
                        field1: <DetailField namaField="Estimasi Tanggal Produk Dikirim" isiField="15 Januari, 2025"/>,
                        field2: <DetailField namaField="Harga yang Diterima (per unit)" isiField="Rp 1.000.000,00"/>,
                        field3: <DetailField namaField="Total Harga" isiField="Rp 100.000.000,00"/> };
            case "dikirim-supplier":
                return { button1: <div></div>, 
                        button2: <div></div>,
                        field1: <DetailField namaField="Tanggal Produk Dikirim" isiField="15 Januari, 2025"/>,
                        field2: <DetailField namaField="Harga yang Diterima (per unit)" isiField="Rp 1.000.000,00"/>,
                        field3: <DetailField namaField="Total Harga" isiField="Rp 100.000.000,00"/> };
            case "diterima-supplier":
                return { button1: <div></div>, 
                        button2: <div></div>,
                        field1: <DetailField namaField="Tanggal Produk Diterima" isiField="15 Januari, 2025"/>,
                        field2: <DetailField namaField="Harga yang Diterima (per unit)" isiField="Rp 1.000.000,00"/>,
                        field3: <DetailField namaField="Total Harga" isiField="Rp 100.000.000,00"/> };
            case "ditolak-supplier":
                return { button1: <div></div>, 
                        button2: <div></div>,
                        field1: <DetailField namaField="Harga yang Diajukan (per unit)" isiField="Rp 1.000.000,00"/>,
                        field2: <div></div>,
                        field3: <div></div> };
            default:
                return { button1: <div></div>, 
                        button2: <div></div>,
                        field1: <div></div>,
                        field2: <div></div>,
                        field3: <div></div> }; // Default case for unmatched or unexpected combinations
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
                <Title title='Supply ABCD-001'/> 
                <Status status={status}/>
            </div>        
            <div className="py-4">
                <DetailField namaField="Nama Supplier" isiField="PT.SUPPLYKURSI"/>
                <DetailField namaField="Nama Produk" isiField="Kursi Kantor"/>
                <DetailField namaField="Kategori Produk" isiField="PERABOTAN"/>
                <DetailField namaField="Jumlah Stok" isiField="100"/>
                <DetailField namaField="Deskripsi Produk" isiField="Kursi Dummy Data"/>
                <DetailField namaField="URL Foto Produk" isiField="https://photic23.vercel.app/"/>
                {detailButtons.field1}
                {detailButtons.field2}
                {detailButtons.field3}
            </div>
            <div className="flex gap-6 pt-3">
                {detailButtons.button1}
                {detailButtons.button2}
            </div>
        </div>
    );
}