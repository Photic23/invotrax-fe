"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Category {
  id: number;
  nama: string;
  batas_stok_kritis: number;
}

interface CategoryModalProps {
  onCategoryAdded: () => void;
  selectedCategory?: Category | null;
  isEdit?: boolean;
}

export default function CategoryModal({
  onCategoryAdded,
  selectedCategory = null,
  isEdit = false,
}: CategoryModalProps) {
  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [batasStokKritis, setBatasStokKritis] = useState<string>("5");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [stokKritisError, setStokKritisError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (selectedCategory && isEdit) {
      setCategoryName(selectedCategory.nama);
      setBatasStokKritis(selectedCategory.batas_stok_kritis.toString());
    }
  }, [selectedCategory, isEdit]);

  const handleOpen = () => {
    setOpen(true);
    if (!isEdit) {
      setCategoryName("");
      setBatasStokKritis("0");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
    setStokKritisError("");
    if (!isEdit) {
      setCategoryName("");
      setBatasStokKritis("0");
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!categoryName.trim()) {
      setError("Nama kategori harus diisi");
      isValid = false;
    } else {
      setError("");
    }

    const stokKritisValue = parseInt(batasStokKritis);
    if (isNaN(stokKritisValue) || stokKritisValue < 0) {
      setStokKritisError("Batas stok kritis harus berupa angka positif");
      isValid = false;
    } else {
      setStokKritisError("");
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_stok/kategori/`;
      let method = "POST";

      if (isEdit && selectedCategory) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_stok/kategori/${selectedCategory.id}/update_kategori/`;
        method = "PATCH";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          nama: categoryName,
          batas_stok_kritis: parseInt(batasStokKritis) || 0
        }),
      });

      if (response.ok) {
        toast({
          title: "Sukses",
          description: isEdit
            ? "Kategori berhasil diperbarui"
            : "Kategori baru berhasil ditambahkan",
          variant: "default",
        });
        handleClose();
        onCategoryAdded();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: isEdit
            ? "Gagal memperbarui kategori"
            : "Gagal menambahkan kategori baru",
          variant: "destructive",
        });
        console.error("API error:", errorData);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memproses permintaan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatasStokChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBatasStokKritis(value);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleOpen}
        className="ml-2"
      >
        {isEdit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="category-modal-form">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoryName" className="text-right">
                  Nama
                </Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Masukkan nama kategori"
                  className={`col-span-3 ${error ? "border-red-500" : ""}`}
                />
              </div>
              {error && <p className="text-sm text-red-500 text-right">{error}</p>}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="batasStokKritis" className="text-right">
                  Batas Stok Kritis
                </Label>
                <Input
                  id="batasStokKritis"
                  type="number"
                  value={batasStokKritis}
                  onChange={handleBatasStokChange}
                  placeholder="Masukkan batas stok kritis"
                  min="0"
                  className={`col-span-3 ${stokKritisError ? "border-red-500" : ""}`}
                />
              </div>
              {stokKritisError && <p className="text-sm text-red-500 text-right">{stokKritisError}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : isEdit ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}