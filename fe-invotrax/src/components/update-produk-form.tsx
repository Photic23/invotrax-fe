import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import CategoryModal from "./kategori-modal";

interface Category {
  id: number;
  nama: string;
  batas_stok_kritis: number;
}

interface Supplier {
  id: number;
  username?: string;
  email?: string;
  phone_number?: string;
  company_name: string;
  role?: string;
}

interface PenawaranDetail {
  display_label: string;
}

interface Kontrak {
  id: number;
  penawaran_detail: PenawaranDetail | null;
  supplier_company_name?: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface UpdateProductFormProps {
  productId: number;
}

export default function UpdateProductForm({
  productId,
}: UpdateProductFormProps) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const router = useRouter();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [contracts, setContracts] = useState<Kontrak[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    kategori: "",
    vendor: "",
    kontrak: "",
    stok: "",
    deskripsi: "",
    harga: "",
  });

  const fetchCategories = async () => {
    try {
      const categoriesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_stok/kategori/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData);

      // Jika ada kategori yang dipilih, refresh kategori terpilih
      if (formData.kategori) {
        const updatedCategory = categoriesData.find(
          (c: any) => c.id.toString() === formData.kategori
        );
        if (updatedCategory) {
          setSelectedCategory(updatedCategory);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Gagal mengambil data kategori",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setIsInitialLoading(true);

        // Fetch product details
        const productResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_stok/produk/${productId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const productData = await productResponse.json();

        // Fetch categories
        const categoriesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_stok/kategori/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Fetch suppliers
        const suppliersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admins/users/?role=vendor`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const suppliersData = await suppliersResponse.json();
        setSuppliers(suppliersData);

        // Fetch contracts
        const contractsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_kontrak/kontrak/daftar_kontrak/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const contractsData = await contractsResponse.json();
        setContracts(contractsData);

        // Set form data with product details
        setFormData({
          nama: productData.nama,
          kategori: productData.kategori_detail.id.toString(),
          vendor: productData.vendor_detail.id.toString(),
          kontrak: productData.kontrak_detail?.id.toString() || "",
          stok: productData.stok.toString(),
          deskripsi: productData.deskripsi || "",
          harga: productData.harga.toString().replace(".00", ""),
        });

        // Set selected category for edit modal
        const selectedCat = categoriesData.find(
          (c: any) => c.id === productData.kategori_detail.id
        );
        if (selectedCat) {
          setSelectedCategory(selectedCat);
        }

        setIsInitialLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil data produk",
          variant: "destructive",
        });
        setIsInitialLoading(false);
      }
    }

    if (productId) {
      fetchData();
    }
  }, [productId, toast]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama produk harus diisi";
    }

    if (!formData.kategori) {
      newErrors.kategori = "Kategori harus dipilih";
    }

    if (!formData.vendor) {
      newErrors.vendor = "Supplier harus dipilih";
    }

    if (!formData.kontrak) {
      newErrors.kontrak = "Kontrak harus dipilih";
    }

    if (!formData.stok || parseInt(formData.stok) < 0) {
      newErrors.stok = "Stok harus diisi dengan angka positif";
    }

    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = "Deskripsi harus diisi";
    }

    if (!formData.harga || parseInt(formData.harga) <= 0) {
      newErrors.harga = "Harga harus diisi dengan angka positif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user selects a value
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Set selected category for edit modal
    if (name === "kategori" && value) {
      const category = categories.find((c) => c.id.toString() === value);
      if (category) {
        setSelectedCategory(category);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if the event originated from the category modal
    const target = e.target as HTMLElement;
    if (target.closest(".category-modal-form")) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Show confirmation modal instead of submitting directly
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setIsLoading(true);

    try {
      const payload = {
        nama: formData.nama,
        kategori: parseInt(formData.kategori),
        vendor: parseInt(formData.vendor),
        kontrak: parseInt(formData.kontrak),
        stok: parseInt(formData.stok),
        deskripsi: formData.deskripsi,
        harga: parseInt(formData.harga),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_stok/produk/${productId}/update_produk/`,
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
          description: "Produk berhasil diperbarui",
          variant: "default",
        });
        router.push(`/produk/${productId}`); // Redirect to product detail page
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: "Gagal memperbarui produk",
          variant: "destructive",
        });
        console.error("API error:", errorData);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui produk",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="relative">
        <button
          onClick={() => router.push(`/produk/${productId}`)}
          className="absolute left-4 top-4 flex items-center text-black-600 hover:text-blue-800 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Kembali</span>
        </button>
        <CardTitle className="text-2xl font-bold text-center">
          Ubah Produk
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Produk</Label>
            <Input
              id="nama"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Masukkan nama produk"
              className={errors.nama ? "border-red-500" : ""}
            />
            {errors.nama && (
              <p className="text-sm text-red-500">{errors.nama}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kategori">Kategori</Label>
            <div className="flex items-center">
              <Select
                value={formData.kategori}
                onValueChange={(value) => handleSelectChange("kategori", value)}
              >
                <SelectTrigger
                  className={`${
                    errors.kategori ? "border-red-500" : ""
                  } flex-1`}
                >
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Tambah Kategori Button */}
              <CategoryModal onCategoryAdded={fetchCategories} />

              {/* Edit Kategori Button - Hanya muncul jika ada kategori yang dipilih */}
              {formData.kategori && (
                <CategoryModal
                  onCategoryAdded={fetchCategories}
                  selectedCategory={selectedCategory}
                  isEdit={true}
                />
              )}
            </div>
            {errors.kategori && (
              <p className="text-sm text-red-500">{errors.kategori}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Supplier</Label>
            <Select
              value={formData.vendor}
              onValueChange={(value) => handleSelectChange("vendor", value)}
            >
              <SelectTrigger className={errors.vendor ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vendor && (
              <p className="text-sm text-red-500">{errors.vendor}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kontrak">Kontrak</Label>
            <Select
              value={formData.kontrak}
              onValueChange={(value) => handleSelectChange("kontrak", value)}
            >
              <SelectTrigger className={errors.kontrak ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih kontrak" />
              </SelectTrigger>
              <SelectContent>
                {contracts.map((contract) => (
                  <SelectItem key={contract.id} value={contract.id.toString()}>
                    {contract.id} {contract.penawaran_detail?.display_label ? `{${contract.penawaran_detail.display_label}}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.kontrak && (
              <p className="text-sm text-red-500">{errors.kontrak}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stok">Stok</Label>
            <Input
              id="stok"
              name="stok"
              type="number"
              value={formData.stok}
              onChange={handleChange}
              placeholder="Masukkan jumlah stok"
              min="0"
              className={errors.stok ? "border-red-500" : ""}
            />
            {errors.stok && (
              <p className="text-sm text-red-500">{errors.stok}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              placeholder="Masukkan deskripsi produk"
              rows={4}
              className={errors.deskripsi ? "border-red-500" : ""}
            />
            {errors.deskripsi && (
              <p className="text-sm text-red-500">{errors.deskripsi}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="harga">Harga per Unit (Rp)</Label>
            <Input
              id="harga"
              name="harga"
              type="number"
              value={formData.harga}
              onChange={handleChange}
              placeholder="Masukkan harga produk"
              min="0"
              className={errors.harga ? "border-red-500" : ""}
            />
            {errors.harga && (
              <p className="text-sm text-red-500">{errors.harga}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full">
            Ubah Produk
          </Button>
        </CardFooter>
      </form>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Update</DialogTitle>
          </DialogHeader>
          <p>Apakah Anda yakin ingin memperbarui produk ini?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Batal
            </Button>
            <Button onClick={confirmSubmit} disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Ya, Perbarui"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
