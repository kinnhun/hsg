import React, { useState } from "react";
import * as XLSX from "xlsx";

const dayMap = {
  "Thứ 2": "Monday",
  "Thứ 3": "Tuesday",
  "Thứ 4": "Wednesday",
  "Thứ 5": "Thursday",
  "Thứ 6": "Friday",
  "Thứ 7": "Saturday",
  "Chủ Nhật": "Sunday",
};

const sessionMap = {
  "Sáng": "Morning",
  "Chiều": "Afternoon",
};

const ImportSchedule = ({ onImport }) => {
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      processExcelData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const processExcelData = (data) => {
    let scheduleArray = [];
    let headers = [];

    data.forEach((row, index) => {
      if (index < 4) return; // Bỏ qua phần tiêu đề

      if (index === 4) {
        headers = row.slice(3); // Lấy danh sách lớp từ cột 4 trở đi
        return;
      }

      const day = dayMap[row[0]];
      const session = sessionMap[row[1]];
      const period = row[2]?.replace("Tiết ", "");

      if (!day || !session || !period) return;

      headers.forEach((header, colIndex) => {
        if (!header || !row[colIndex + 3]) return;

        const [subject, teacher] = row[colIndex + 3].split(" - ");
        const [grade, className] = header.replace("Khối ", "").split(" - ");

        scheduleArray.push({
          grade,
          className,
          day,
          session,
          period: parseInt(period),
          subject,
          teacher,
        });
      });
    });

    console.log(scheduleArray);
    onImport(scheduleArray);
  };

  return (
    <div className="import-container">
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="import-input" />
      {fileName && <p className="file-name">Đã chọn: {fileName}</p>}
    </div>
  );
};

export default ImportSchedule;