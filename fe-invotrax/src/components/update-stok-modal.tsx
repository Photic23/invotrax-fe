import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Reusable hook for auth token
function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  return token;
}

interface StockUpdateModalProps {
  product: {
    id: number;
    nama: string;
    stok: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: number, newStock: number) => void;
}

export function StockUpdateModal({
  product,
  isOpen,
  onClose,
  onSave,
}: StockUpdateModalProps) {
  const token = useAuthToken();
  const [stockValue, setStockValue] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setStockValue(product.stok);
    }
  }, [product]);

  const handleIncrement = () => {
    setStockValue((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setStockValue((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleSave = async () => {
    if (!product) return;
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_stok/produk/${product.id}/update_produk/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ stok: stockValue }),
        }
      );

      if (response.ok) {
        onSave(product.id, stockValue);
        onClose();
        toast({
          title: "Sukses",
          description: `Stok produk ${product.nama} berhasil diperbarui`,
          variant: "default",
        });
      } else {
        console.error("Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Stok</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <Button variant="outline" size="icon" onClick={handleDecrement}>
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={stockValue}
            onChange={(e) => setStockValue(parseInt(e.target.value) || 0)}
            className="text-center"
          />
          <Button variant="outline" size="icon" onClick={handleIncrement}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}