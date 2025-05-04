import { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button"; // ShadCN Button
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, X } from "lucide-react";
import PropTypes from "prop-types";

const ExportExcelByColumn = ({
  fileName = "data.xlsx",
  allData,
  visibleColumns,
}) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(
    visibleColumns.filter((col) => col.id !== "actions"), // Loại bỏ cột "actions"
  );

  const handleExport = async () => {
    if (!allData || allData.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }
    if (selectedColumns.length === 0) {
      alert("Vui lòng chọn ít nhất một cột!");
      return;
    }

    try {
      setLoading(true);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Danh sách giáo viên");

      worksheet.columns = selectedColumns.map(({ id, label }) => ({
        header: label,
        key: id,
        width: 20,
      }));

      allData.forEach((row) => {
        const filteredRow = {};
        selectedColumns.forEach(({ id }) => {
          // Handle parent information
          if (
            id.includes("Father") ||
            id.includes("Mother") ||
            id.includes("Guardian")
          ) {
            filteredRow[id] = row.parent?.[id] || "";
          } else {
            filteredRow[id] = row[id] || "";
          }
        });
        worksheet.addRow(filteredRow);
      });

      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: "center" };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF00" },
        };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      alert("Lỗi khi xuất Excel: " + (error.message || "Không xác định"));
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const toggleColumn = (id) => {
    setSelectedColumns((prev) =>
      prev.some((col) => col.id === id)
        ? prev.filter((col) => col.id !== id)
        : [...prev, visibleColumns.find((col) => col.id === id)],
    );
  };

  const handleSelectAll = () => {
    const allSelectableColumns = visibleColumns.filter(
      (col) => col.id !== "actions",
    );
    setSelectedColumns(
      selectedColumns.length === allSelectableColumns.length
        ? []
        : allSelectableColumns,
    );
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        disabled={loading}
      >
        {loading ? "Đang xuất..." : "Xuất Excel"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chọn cột để xuất</DialogTitle>
          </DialogHeader>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Chọn các cột hiển thị</span>
            <Button variant="ghost" onClick={handleSelectAll} size="sm">
              {selectedColumns.length === visibleColumns.length - 1 ? (
                <X className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {selectedColumns.length === visibleColumns.length - 1
                ? "Bỏ chọn tất cả"
                : "Chọn tất cả"}
            </Button>
          </div>

          <ScrollArea className="h-[300px] pr-4">
            <div className="grid grid-cols-2 gap-4 py-2">
              {visibleColumns
                .filter((col) => col.id !== "actions")
                .map((col) => (
                  <div key={col.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={col.id}
                      checked={selectedColumns.some((c) => c.id === col.id)}
                      onCheckedChange={() => toggleColumn(col.id)}
                    />
                    <label
                      htmlFor={col.id}
                      className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {col.label}
                    </label>
                  </div>
                ))}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleExport} className="gap-1">
              <Check className="h-4 w-4" /> Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

ExportExcelByColumn.propTypes = {
  fileName: PropTypes.string,
  allData: PropTypes.array.isRequired,
  visibleColumns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default ExportExcelByColumn;
