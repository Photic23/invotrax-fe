import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface ModalUpdatePengajuanPenawaranProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  id: number | null;
}

export default function ModalUpdatePengajuanPenawaran({
  open,
  onClose,
  onConfirm,
  id,
}: ModalUpdatePengajuanPenawaranProps) {
  if (!open || id === null) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Penawaran Pengadaan</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          <h3 className="text-sm">
            Apakah Anda yakin ingin mengupdate
            <br />
            <span className="font-semibold text-lg">PROD-{id}</span>?
          </h3>
        </div>
        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={onClose} className="w-1/2">
              Batal
            </Button>
            <Button onClick={onConfirm} className="w-1/2">
              Ya
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
