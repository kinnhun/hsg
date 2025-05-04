import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        tabIndex={-1}
        autoFocus={false}
        className="max-w-md border border-gray-200 bg-white shadow-xl"
      >
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {title || "Xác nhận xóa"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {description || "Bạn có chắc chắn muốn xóa không?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
