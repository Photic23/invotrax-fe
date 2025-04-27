"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface PenawaranPengadaan {
  id: number;
  nama_produk: string;
  status: string;
  created_at: string;
}

export default function PengajuanPenawaranTable() {
  const { getToken } = useAuth();
  const token = getToken();
  const router = useRouter();
  const [penawaran, setPenawaran] = useState<PenawaranPengadaan[]>([]);
  const [filteredPenawaran, setFilteredPenawaran] = useState<PenawaranPengadaan[]>([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPenawaran = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pengajuan/pengajuan_penawaran_pengadaan/daftar_pengajuan_penawaran_pengadaan/`,
          {
            method: "GET",
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Gagal mengambil data penawaran.");

        const data = await response.json();
        setPenawaran(data);
        setFilteredPenawaran(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPenawaran();
  }, [token]);

  useEffect(() => {
    const filtered = penawaran.filter((item) => {
      const kode = `PROD-${item.id}`.toLowerCase();
      const namaProduk = item.nama_produk.toLowerCase();
      const keyword = search.toLowerCase();

      const matchSearch = kode.includes(keyword) || namaProduk.includes(keyword);
      const matchDate = date?.from && date?.to
        ? new Date(item.created_at) >= date.from && new Date(item.created_at) <= date.to
        : true;

      return matchSearch && matchDate;
    });

    setFilteredPenawaran(filtered);
  }, [search, date, penawaran]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (penawaran.length === 0) {
    return <div>Anda belum mengajukan penawaran pengadaan</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Cari kode atau nama produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
        <DatePickerWithRange date={date} setDate={setDate} />
      </div>

      {filteredPenawaran.length === 0 ? (
        <div>Pengajuan penawaran tidak ditemukan.</div>
      ) : (
        <table className="w-full mt-4 border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border-b p-2 text-left">Kode</th>
              <th className="border-b p-2 text-left">Nama Produk</th>
              <th className="border-b p-2 text-left">Status</th>
              <th className="border-b p-2 text-left">Tanggal Diajukan</th>
              <th className="border-b p-2 text-left">Edit</th>
            </tr>
          </thead>
          <tbody>
            {filteredPenawaran.map((row) => (
              <tr key={row.id}>
                <td className="border-b p-2">{`PROD-${row.id}`}</td>
                <td className="border-b p-2">{row.nama_produk}</td>
                <td className="border-b p-2">{row.status}</td>
                <td className="border-b p-2">{format(new Date(row.created_at), "yyyy-MM-dd")}</td>
                <td className="border-b p-2">
                  <Button variant="ghost" onClick={() => router.push(`/pengajuan_penawaran_pengadaan/${row.id}/update`)}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
