import React from 'react';
import * as XLSX from 'xlsx';
import { FileDown } from 'lucide-react';

const ExportSchedule = ({ schedule, showTeacherName }) => {
  const handleExport = () => {
    if (!schedule?.details) return;

    // Prepare data for export
    const exportData = [];
    const headerRowCount = 6;

    // Add header information
    exportData.push(['THỜI KHÓA BIỂU - TRƯỜNG THCS HẢI GIANG']);
    exportData.push([`Học kỳ ${schedule.semesterId === 1 ? 'I' : 'II'}`]);
    exportData.push([`Thời gian áp dụng: Từ ${new Date(schedule.effectiveDate).toLocaleDateString('vi-VN')} đến ${new Date(schedule.endDate).toLocaleDateString('vi-VN')}`]);
    exportData.push([]); // Empty row for spacing

    // Get unique classes and group by grade
    const classes = [...new Set(schedule.details.map(item => item.className))].sort();
    const gradeClasses = classes.reduce((acc, className) => {
      const grade = className.charAt(0);
      if (!acc[grade]) acc[grade] = [];
      acc[grade].push(className);
      return acc;
    }, {});

    // Add grade headers
    const gradeHeaderRow = ['', '', '', ...Object.entries(gradeClasses).flatMap(([grade, gClasses]) => [`Khối ${grade}`, ...Array(gClasses.length - 1).fill('')])];
    exportData.push(gradeHeaderRow);

    // Add table headers
    const headers = ['Thứ', 'Buổi', 'Tiết', ...classes];
    exportData.push(headers);

    // Add schedule data
    const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
    const shifts = [
      { name: 'Sáng', periods: [1, 2, 3, 4, 5] },
      { name: 'Chiều', periods: [6, 7, 8] }
    ];

    let currentRowIndex = headerRowCount; // Start data rows after headers
    const merges = [
      // Title cell
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      // Semester cell
      { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
      // Date range cell
      { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } },
    ];

    // Add merges for grade headers (Row index 4)
    let currentGradeCol = 3; // Start after Thứ, Buổi, Tiết
    Object.values(gradeClasses).forEach(gClasses => {
      if (gClasses.length > 1) {
        merges.push({
          s: { r: 4, c: currentGradeCol },
          e: { r: 4, c: currentGradeCol + gClasses.length - 1 }
        });
      }
      currentGradeCol += gClasses.length;
    });

    days.forEach(day => {
      const startRowDay = currentRowIndex;
      let totalPeriodsInDay = 0;

      shifts.forEach((shift, shiftIndex) => {
        const startRowShift = currentRowIndex;
        shift.periods.forEach((period, periodIndex) => {
          const row = [];
          // Add Day only for the first period of the first shift
          row.push(shiftIndex === 0 && periodIndex === 0 ? day : '');
          // Add Shift name only for the first period of the shift
          row.push(periodIndex === 0 ? shift.name : '');
          row.push(schedule.details.find(item => item.periodId === period)?.periodName || `Tiết ${period}`); // Use periodName if available

          classes.forEach(className => {
            const scheduleItem = schedule.details.find(
              item =>
                item.dayOfWeek === day &&
                item.periodId === period &&
                item.className === className
            );

            if (scheduleItem) {
              const cellContent = showTeacherName
                ? `${scheduleItem.subjectName}\n${scheduleItem.teacherName}`
                : scheduleItem.subjectName;
              row.push(cellContent);
            } else {
              row.push('');
            }
          });

          exportData.push(row);
          currentRowIndex++;
          if (shiftIndex === 0 && periodIndex === 0) totalPeriodsInDay = 0; // Reset for day count start
          totalPeriodsInDay++;
        });

        // Add merge for Shift (Buổi) - Column 1
        if (shift.periods.length > 1) {
          merges.push({
            s: { r: startRowShift, c: 1 },
            e: { r: currentRowIndex - 1, c: 1 }
          });
        }
      });

      // Add merge for Day (Thứ) - Column 0
      if (totalPeriodsInDay > 1) {
        merges.push({
          s: { r: startRowDay, c: 0 },
          e: { r: currentRowIndex - 1, c: 0 }
        });
      }

    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(exportData);

    // Apply merges
    ws['!merges'] = merges;

    // Style configurations
    const headerStyle = {
      font: { bold: true },
      alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    };
    const cellStyle = {
      alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    };

    // Apply styles
    for (let R = 0; R < exportData.length; ++R) {
      for (let C = 0; C < exportData[R].length; ++C) {
        const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
        if (!ws[cell_address]) ws[cell_address] = {}; // Ensure cell object exists

        // Apply header style to header rows (0-5), cell style otherwise
        ws[cell_address].s = (R < headerRowCount) ? headerStyle : cellStyle;

        // Specific style for the main title
        if (R === 0) {
          ws[cell_address].s = {
            ...headerStyle,
            font: { bold: true, sz: 16 } // Larger font size for title
          };
        }
        // Specific style for semester and date range
        if (R === 1 || R === 2) {
          ws[cell_address].s = {
            ...headerStyle,
            font: { bold: true, sz: 12 }
          };
        }
        // Specific style for grade header and class header row
        if (R === 4 || R === 5) {
          ws[cell_address].s = {
            ...headerStyle,
            font: { bold: true, sz: 11 }
          };
        }
      }
    }

    // Set column widths (adjust as needed)
    ws['!cols'] = [
      { wch: 12 }, // Thứ
      { wch: 8 },  // Buổi
      { wch: 10 },  // Tiết
      ...classes.map(() => ({ wch: 20 })) // Class columns - increased width
    ];

    // Set row heights (adjust as needed)
    ws['!rows'] = exportData.map((row, index) => ({
      hpt: index === 0 ? 30 : (index < headerRowCount ? 20 : 40) // Taller rows for data cells
    }));

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Thời khóa biểu');

    // Generate filename with current date
    const today = new Date();
    const filename = `ThoiKhoaBieu_${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  return (
    <button
      className="btn-export"
      onClick={handleExport}
      disabled={!schedule?.details}
    >
      <FileDown size={16} /> Xuất Excel
    </button>
  );
};

export default ExportSchedule;
