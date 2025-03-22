import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PenawaranPengadaan {
    id: number;
    nama_produk: string;
    status: string;
    created_at: string;
}

// function useAuthToken() {
//     const [token, setToken] = useState<string | null>(null);
  
//     useEffect(() => {
//       if (typeof window !== "undefined") {
//         setToken(localStorage.getItem("token"));
//       }
//     }, []);
  
//     return token;
// }

export default function PenawaranTable() {
    const { getToken } = useAuth();
    const token = getToken();
    const [penawaran, setPenawaran] = useState<PenawaranPengadaan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchPenawaran = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/penawaran/daftar_penawaran_pengadaan/`,
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
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
          setLoading(false);
        }
      };
  
      fetchPenawaran();
    }, [token]);
  
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
  
    return (
      <table className="w-full mt-4 border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border-b p-2 text-left">Kode</th>
            <th className="border-b p-2 text-left">Nama Produk</th>
            <th className="border-b p-2 text-left">Status</th>
            <th className="border-b p-2 text-left">Tanggal Diajukan</th>
          </tr>
        </thead>
        <tbody>
          {penawaran.map((row) => (
            <tr key={row.id}>
              <td className="border-b p-2">{`PROD-${row.id}`}</td>
              <td className="border-b p-2">{row.nama_produk}</td>
              <td className="border-b p-2">{row.status}</td>
              <td className="border-b p-2">{new Date(row.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
}