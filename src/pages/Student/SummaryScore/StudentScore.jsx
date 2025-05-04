import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { studentData } from "./studentData";
import StudentScoreHeader from "./StudentScoreHeader";

export default function StudentScore() {
  const [semester, setSemester] = useState(1);
  const [studentDada, setStudentDada] = useState(studentData);

  // Hàm để xác định màu nền dựa trên học lực

  const getScoreBackgroundColor = (score) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return "";
    if (numScore >= 8.5) return "bg-green-100";
    if (numScore >= 7.0) return "bg-blue-100";
    if (numScore >= 5.0) return "bg-yellow-100";
    return "bg-red-100";
  };
  const scoreCol = Array.from({ length: 4 });
  console.log(Object.entries(studentDada.subjects));

  return (
    <Card className="relative mt-6 p-4 shadow-md">
      <StudentScoreHeader setSemester={setSemester} />
      <div className="h-fit overflow-auto rounded-md border border-gray-200">
        {/* Container cho bảng với overflow-x-auto */}
        <div className="min-w-max">
          <Table className="w-full border-collapse text-center [&_td]:border [&_td]:border-gray-300 [&_th]:border [&_th]:border-gray-300">
            <TableHeader className="bg-gray-100">
              {/* Hàng đầu tiên: Gộp tiêu đề "ĐGDTX" */}
              <TableRow className="h-10">
                <TableHead
                  rowSpan={2}
                  className="h-5 w-5 text-center font-semibold"
                >
                  STT
                </TableHead>
                <TableHead
                  rowSpan={2}
                  className="h-5 w-60 text-center font-semibold"
                >
                  Họ và tên
                </TableHead>

                {/* Gộp cột tiêu đề DGDTX */}
                <TableHead
                  colSpan={scoreCol.length}
                  className="h-5 w-40 text-center font-semibold"
                >
                  ĐGDTX
                </TableHead>

                {/* Các cột khác */}
                <TableHead
                  rowSpan={2}
                  className="h-5 text-center font-semibold"
                >
                  DDGGK
                </TableHead>
                <TableHead
                  rowSpan={2}
                  className="h-5 text-center font-semibold"
                >
                  DDGCK
                </TableHead>
                <TableHead
                  rowSpan={2}
                  className="h-5 text-center font-semibold"
                >
                  TBM
                </TableHead>
                {semester == 2 && (
                  <TableHead
                    rowSpan={2}
                    className="h-5 text-center font-semibold"
                  >
                    TBMCN
                  </TableHead>
                )}
                <TableHead
                  rowSpan={2}
                  className="h-5 text-center font-semibold"
                >
                  Nhận xét
                </TableHead>
                {semester == 2 && (
                  <TableHead
                    rowSpan={2}
                    className="h-5 text-center font-semibold"
                  >
                    Nhận xét cả năm
                  </TableHead>
                )}
              </TableRow>

              {/* Hàng thứ 2: Hiển thị số thứ tự của DGDTX */}
              <TableRow>
                {scoreCol.map((_, index) => (
                  <TableHead
                    key={index}
                    className="h-10 w-10 text-center font-semibold"
                  >
                    {index + 1}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(studentData.subjects).map(
                ([subject, data], index) => (
                  <TableRow
                    key={index}
                    className="divide-x divide-gray-300 transition-colors hover:bg-gray-50"
                  >
                    <TableCell className="text-center font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="border border-gray-300 pl-2 text-left font-medium">
                      {subject}
                    </TableCell>

                    {/* Điểm học kỳ 1 */}
                    {semester == 1
                      ? data.HK1.DGDTX.map((grade, index) => (
                          <TableCell
                            key={index}
                            className="border border-gray-300 text-center"
                          >
                            {grade}
                          </TableCell>
                        ))
                      : data.HK2.DGDTX.map((grade, index) => (
                          <TableCell
                            key={index}
                            className="border border-gray-300 text-center"
                          >
                            {grade}
                          </TableCell>
                        ))}

                    <TableCell className="border border-gray-300 text-center">
                      {semester == 1 ? data.HK1.DDGGK : data.HK2.DDGGK}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-center">
                      {semester == 1 ? data.HK1.DDGCK : data.HK2.DDGCK}
                    </TableCell>
                    <TableCell
                      className={`border border-gray-300 text-center font-medium ${getScoreBackgroundColor(
                        semester == 1 ? data.HK1.TBM : data.HK2.TBM,
                      )}`}
                    >
                      {semester == 1 ? data.HK1.TBM : data.HK2.TBM}
                    </TableCell>
                    {semester == 2 && (
                      <TableCell
                        className={`border border-gray-300 text-center font-medium ${getScoreBackgroundColor(
                          ((+data.HK1.TBM + +data.HK2.TBM) / 2).toFixed(1),
                        )}`}
                      >
                        {((+data.HK1.TBM + +data.HK2.TBM) / 2).toFixed(1)}
                      </TableCell>
                    )}
                    <TableCell className="border border-gray-300 text-center">
                      {semester == 1
                        ? studentData.review.HK1
                        : studentData.review.HK2}
                    </TableCell>
                    {semester == 2 && (
                      <TableCell className="border border-gray-300 text-center">
                        {studentData.reviewCN}
                      </TableCell>
                    )}
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
