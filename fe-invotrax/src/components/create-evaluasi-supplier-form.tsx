"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CreateEvaluasiSupplierFormProps {
  supplierId: number;
}

interface CategoryRatings {
  kualitas: number;
  harga: number;
  pengiriman: number;
  fleksibilitas: number;
  responsif: number;
  overall: number;
}

const initialForm = {
  kualitas_1: 0,
  kualitas_2: 0,
  kualitas_3: 0,
  kualitas_4: 0,
  kualitas_5: 0,
  harga_1: 0,
  harga_2: 0,
  harga_3: 0,
  pengiriman_1: 0,
  pengiriman_2: 0,
  pengiriman_3: 0,
  fleksibilitas_1: 0,
  fleksibilitas_2: 0,
  fleksibilitas_3: 0,
  responsif_1: 0,
  responsif_2: 0,
};

const CreateEvaluasiSupplierForm = ({ supplierId }: CreateEvaluasiSupplierFormProps) => {
  const { getToken } = useAuth();
  const token = getToken();
  const { toast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [categoryRatings, setCategoryRatings] = useState<CategoryRatings>({
    kualitas: 0,
    harga: 0,
    pengiriman: 0,
    fleksibilitas: 0,
    responsif: 0,
    overall: 0
  });

  useEffect(() => {
    const fetchSupplier = async () => {
      if (!supplierId || !token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/users/${supplierId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setCompanyName(data.company_name);
        } else {
          console.error("Gagal mengambil nama supplier");
        }
      } catch (error) {
        console.error("Error saat mengambil nama supplier:", error);
      }
    };
    fetchSupplier();
  }, [supplierId, token]);

  const handleChange = (field: string, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    Object.entries(form).forEach(([key, value]) => {
      if (!value) {
        newErrors[key] = "Wajib diisi";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Harap isi semua penilaian",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        supplier_vendor: supplierId,
        ...form,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evaluasi_supplier/evaluasi-supplier/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {}

      if (response.ok) {
        toast({
          title: "Sukses",
          description: "Evaluasi berhasil disimpan.",
        });
        router.push("/evaluasi-supplier");
      } else {
        if (data && typeof data === "object") {
          const newErrors: Record<string, string> = {};
          Object.entries(data).forEach(([key, val]) => {
            if (typeof val === "object" && Array.isArray(val)) {
              newErrors[key] = val[0];
            }
          });
          setErrors(newErrors);
        }

        toast({
          title: "Gagal",
          description: data?.detail || "Terjadi kesalahan saat menyimpan evaluasi.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Gagal:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan evaluasi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateRatings = () => {
    const kualitasRating = (form.kualitas_1 + form.kualitas_2 + form.kualitas_3 + form.kualitas_4 + form.kualitas_5) / 5;
    const hargaRating = (form.harga_1 + form.harga_2 + form.harga_3) / 3;
    const pengirimanRating = (form.pengiriman_1 + form.pengiriman_2 + form.pengiriman_3) / 3;
    const fleksibilitasRating = (form.fleksibilitas_1 + form.fleksibilitas_2 + form.fleksibilitas_3) / 3;
    const responsifRating = (form.responsif_1 + form.responsif_2) / 2;

    const overallRating = (kualitasRating + hargaRating + pengirimanRating + fleksibilitasRating + responsifRating) / 5;

    setCategoryRatings({
      kualitas: Number(kualitasRating.toFixed(2)),
      harga: Number(hargaRating.toFixed(2)),
      pengiriman: Number(pengirimanRating.toFixed(2)),
      fleksibilitas: Number(fleksibilitasRating.toFixed(2)),
      responsif: Number(responsifRating.toFixed(2)),
      overall: Number(overallRating.toFixed(2))
    });
  };

  useEffect(() => {
    calculateRatings();
  }, [form]);

  const renderQuestionRow = (no: string | number, pertanyaan: string, field: string) => (
    <tr className="border-b">
      <td className="py-4 px-2 text-center font-semibold">{no}</td>
      <td className="py-4 px-4">{pertanyaan}</td>
      <td className="py-4 px-4">
        <div className="flex justify-center gap-6">
          {[1, 2, 3, 4, 5].map((val) => (
            <label key={val} className="flex flex-col items-center space-y-1">
              <span className="text-sm font-medium text-gray-600">{val}</span>
              <input
                type="radio"
                name={field}
                value={val}
                checked={form[field as keyof typeof form] === val}
                onChange={() => handleChange(field, val)}
                className="form-radio h-4 w-4"
                required
              />
            </label>
          ))}
        </div>
      </td>
    </tr>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Evaluasi Supplier ({companyName})
      </h1>
      <div className="mb-6 p-4 bg-gray-100 rounded-md border text-sm text-gray-700">
        <p className="mb-1 font-semibold">Kriteria Penilaian:</p>
        <ul className="list-disc pl-5 space-y-1">
          <p><strong>1</strong> = Sangat Buruk</p>
          <p><strong>2</strong> = Buruk</p>
          <p><strong>3</strong> = Cukup</p>
          <p><strong>4</strong> = Baik</p>
          <p><strong>5</strong> = Sangat Baik</p>
        </ul>
      </div>

      <div className="mb-6 p-4 bg-white rounded-md border shadow-sm">
        <h3 className="text-lg font-bold mb-3">Ringkasan Rating</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-600">Kualitas</div>
            <div className="text-xl font-bold">{categoryRatings.kualitas}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-600">Harga</div>
            <div className="text-xl font-bold">{categoryRatings.harga}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-600">Pengiriman</div>
            <div className="text-xl font-bold">{categoryRatings.pengiriman}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-600">Fleksibilitas</div>
            <div className="text-xl font-bold">{categoryRatings.fleksibilitas}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-600">Responsivitas</div>
            <div className="text-xl font-bold">{categoryRatings.responsif}</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-md">
            <div className="text-sm text-blue-600">Overall Rating</div>
            <div className="text-xl font-bold text-blue-700">{categoryRatings.overall}</div>
          </div>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="py-3 px-2 text-left w-16">No</th>
            <th className="py-3 px-4 text-left">Item Evaluasi</th>
            <th className="py-3 px-4 text-center">Nilai</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-gray-50 font-bold">
            <td className="py-3 px-2 text-center">A</td>
            <td className="py-3 px-4">Kualitas</td>
            <td className="py-3 px-4 text-center">{categoryRatings.kualitas}</td>
          </tr>
          {renderQuestionRow(1, "Produk yang diterima sesuai dengan spesifikasi yang diminta.", "kualitas_1")}
          {renderQuestionRow(2, "Packaging produk dalam kondisi baik dan tidak rusak.", "kualitas_2")}
          {renderQuestionRow(3, "Jumlah produk yang dikirim sesuai dengan jumlah yang diminta.", "kualitas_3")}
          {renderQuestionRow(4, "Produk yang diterima dalam kondisi baik dan tidak rusak.", "kualitas_4")}
          {renderQuestionRow(5, "Supplier melakukan inspeksi terhadap semua produk sebelum pengiriman.", "kualitas_5")}

          <tr className="bg-gray-50 font-bold">
            <td className="py-3 px-2 text-center">B</td>
            <td className="py-3 px-4">Harga</td>
            <td className="py-3 px-4 text-center">{categoryRatings.harga}</td>
          </tr>
          {renderQuestionRow(6, "Harga produk yang ditawarkan sesuai dengan harga pasar.", "harga_1")}
          {renderQuestionRow(7, "Biaya pengiriman produk sesuai dengan yang tercantum dalam penawaran.", "harga_2")}
          {renderQuestionRow(8, "Harga produk sesuai dengan estimasi internal perusahaan.", "harga_3")}

          <tr className="bg-gray-50 font-bold">
            <td className="py-3 px-2 text-center">C</td>
            <td className="py-3 px-4">Pengiriman</td>
            <td className="py-3 px-4 text-center">{categoryRatings.pengiriman}</td>
          </tr>
          {renderQuestionRow(9, "Produk dikirim sesuai dengan jadwal yang telah disepakati.", "pengiriman_1")}
          {renderQuestionRow(10, "Tidak terjadi keterlambatan dalam pengiriman produk.", "pengiriman_2")}
          {renderQuestionRow(11, "Tidak terjadi perubahan jadwal pengiriman yang dilakukan secara sepihak oleh supplier.", "pengiriman_3")}

          <tr className="bg-gray-50 font-bold">
            <td className="py-3 px-2 text-center">D</td>
            <td className="py-3 px-4">Fleksibilitas</td>
            <td className="py-3 px-4 text-center">{categoryRatings.fleksibilitas}</td>
          </tr>
          {renderQuestionRow(12, "Supplier mampu memenuhi perubahan jumlah produk yang dipesan.", "fleksibilitas_1")}
          {renderQuestionRow(13, "Supplier mampu mengakomodasi perubahan jumlah tanpa mempengaruhi jadwal pengiriman.", "fleksibilitas_2")}
          {renderQuestionRow(14, "Supplier mampu memenuhi perubahan jadwal pengiriman produk.", "fleksibilitas_3")}

          <tr className="bg-gray-50 font-bold">
            <td className="py-3 px-2 text-center">E</td>
            <td className="py-3 px-4">Responsivitas</td>
            <td className="py-3 px-4 text-center">{categoryRatings.responsif}</td>
          </tr>
          {renderQuestionRow(15, "Supplier mampu menyelesaikan masalah yang terjadi dengan cepat dan efektif.", "responsif_1")}
          {renderQuestionRow(16, "Supplier mampu mengakomodasi perubahan-perubahan permintaan dari customer.", "responsif_2")}
        </tbody>
      </table>

      <div className="flex justify-center mt-8">
        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Evaluasi"}
        </button>
      </div>
    </form>
  );
};

export default CreateEvaluasiSupplierForm;
