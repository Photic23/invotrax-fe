import { ButtonPengadaan } from "@/components/elements/detail/ButtonPengadaan";
import { DetailField } from "@/components/elements/detail/DetailField";
import { Title } from "@/components/elements/detail/TitlePengadaan";

export default function PengadaanDeleteSuccess() {
    return (
        <div className="px-14 content-center py-6">
            <div className="flex justify-between">
                <Title title='Supply ABCD-001'/> 
            </div>
            <div className="py-4">
                <DetailField namaField="Request berhasil dihapus." isiField=""/>
                <ButtonPengadaan content="Daftar Request"/>
            </div>
        </div>
    )

}