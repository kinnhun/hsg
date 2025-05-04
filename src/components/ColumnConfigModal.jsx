import { useState, useEffect, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X } from "lucide-react";
import PropTypes from "prop-types";

const ColumnConfigModal = ({
  isOpen,
  onClose,
  columns,
  selectedColumns,
  onSave,
}) => {
  const [localSelectedColumns, setLocalSelectedColumns] =
    useState(selectedColumns);

  // Cập nhật khi selectedColumns thay đổi
  useEffect(() => {
    setLocalSelectedColumns(selectedColumns);
  }, [selectedColumns, isOpen]);

  // Kiểm tra xem đã chọn hết chưa
  const allSelected = useMemo(
    () => columns.length === localSelectedColumns.length,
    [columns, localSelectedColumns],
  );

  // Chọn/Bỏ chọn một cột
  const handleToggleColumn = (columnId) => {
    setLocalSelectedColumns((prev) =>
      prev.some((col) => col.id === columnId)
        ? prev.filter((col) => col.id !== columnId)
        : [...prev, columns.find((col) => col.id === columnId)],
    );
  };

  // Chọn/Bỏ chọn tất cả cột
  const handleSelectAll = () => {
    setLocalSelectedColumns(allSelected ? [] : [...columns]);
  };

  // Lưu thay đổi
  const handleSave = () => {
    onSave(localSelectedColumns);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cấu hình cột hiển thị</DialogTitle>
        </DialogHeader>

        {/* Chọn tất cả / Bỏ chọn tất cả */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Chọn các cột hiển thị</span>
          <Button variant="ghost" onClick={handleSelectAll} size="sm">
            {allSelected ? (
              <X className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </Button>
        </div>

        {/* Danh sách cột */}
        <ScrollArea className="h-[300px] pr-4">
          <div className="grid grid-cols-2 gap-4 py-2">
            {columns.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={column.id}
                  checked={localSelectedColumns.some(
                    (col) => col.id === column.id,
                  )}
                  onCheckedChange={() => handleToggleColumn(column.id)}
                />
                <label
                  htmlFor={column.id}
                  className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {column.label}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave} className="gap-1">
            <Check className="h-4 w-4" /> Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

ColumnConfigModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  selectedColumns: PropTypes.array.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ColumnConfigModal;
