import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button"; // ShadCN Button
import PropTypes from "prop-types";
import { axiosInstance } from "@/services/axios";
import { useState } from "react";

const ExportExcel = ({ type = "", fileName = "data.xlsx", data }) => {
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/${type}`);
      const data = res.data;
      await handleExport(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      alert("Lỗi khi tải dữ liệu: " + (error.message || "Không xác định"));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (data) => {
    if (!data || data.length === 0) {
      alert("Không có dữ liệu!");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");

      // Thêm tiêu đề cột
      const columns = Object.keys(data[0]).map((key) => ({
        header: key.toUpperCase(),
        key: key,
        width: 20,
      }));
      worksheet.columns = columns;

      // Thêm dữ liệu vào bảng
      data.forEach((row) => {
        worksheet.addRow(row);
      });

      // Thiết lập style cho header
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: "center" };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF00" },
        };
      });

      // Xuất file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      alert("Lỗi khi xuất Excel: " + (error.message || "Không xác định"));
    }
  };

  return (
    <Button onClick={getData} variant="outline" disabled={loading}>
      {loading ? "Đang xuất..." : "Export Excel"}
    </Button>
  );
};

ExportExcel.propTypes = {
  type: PropTypes.string.isRequired,
  fileName: PropTypes.string,
};

export default ExportExcel;
