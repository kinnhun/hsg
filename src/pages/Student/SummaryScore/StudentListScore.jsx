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
import { summaryStudentScore } from "./data";
import { summaryStudentScore2 } from "./data2";

// Sample data - replace with actual API data in production

export default function StudentListScore() {
  const [data, setData] = useState(summaryStudentScore);

  // Hàm để xác định màu nền dựa trên học lực
  const getAcademicPerformanceColor = (performance) => {
    switch (performance?.toLowerCase()) {
      case "giỏi":
        return "bg-green-100";
      case "khá":
        return "bg-blue-100";
      case "trung bình":
        return "bg-yellow-100";
      case "yếu":
        return "bg-red-100";
      default:
        return "";
    }
  };

  return (
    <Card className="relative mt-6 p-4 shadow-md">
      <div className="bg-blue-50 p-4">
        <h2 className="text-2xl font-bold text-blue-800">Bảng điểm tổng kết</h2>
        {/* <p className="text-gray-600">Học sinh: {data.name}</p> */}
      </div>

      <div className="max-h-[500px] overflow-auto p-4">
        {/* Container cho bảng với overflow-x-auto */}
        <div className="min-w-max">
          <Table className="w-full border border-gray-300 text-center">
            <TableHeader className="sticky top-0 z-10 bg-gray-100">
              <TableRow>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  STT
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  Họ tên
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  Ngữ văn
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  Toán
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  Tiếng Anh
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  Vật lí
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  GDCD
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  Hóa học
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  Sinh học
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  Lịch sử
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  Công nghệ
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  Địa lí
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  Thể dục
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  Âm nhạc
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  Mĩ thuật
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  TBCM
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  Học lực
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  Hạnh kiểm
                </TableHead>
                <TableHead className="border border-gray-300 bg-blue-700 text-center font-bold text-white">
                  Xếp hạng
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((student, index) => (
                  <TableRow
                    key={student.STT}
                    className={`divide-x divide-gray-300 hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <TableCell className="h-10 border border-gray-300 text-center font-medium">
                      {student.STT}
                    </TableCell>
                    <TableCell className="h-10 border border-gray-300 text-center font-medium">
                      {student.name}
                    </TableCell>

                    <TableCell className="h-10 border border-gray-300 text-center">
                      {student.literature}
                    </TableCell>
                    <TableCell className="h-10 border border-gray-300 text-center">
                      {student.math}
                    </TableCell>
                    <TableCell className="h-10 border border-gray-300 text-center">
                      {student.english}
                    </TableCell>

                    <TableCell className="h-10 border border-gray-300 text-center">
                      {student.physics}
                    </TableCell>
                    <TableCell className="h-10 max-w-40 border border-gray-300 text-center">
                      {student.civics}
                    </TableCell>
                    <TableCell className="h-10 max-w-40 border border-gray-300 text-center">
                      {student.chemistry}
                    </TableCell>
                    <TableCell className="h-10 max-w-40 border border-gray-300 text-center">
                      {student.biology}
                    </TableCell>
                    <TableCell className="h-10 max-w-40 border border-gray-300 text-center">
                      {student.history}
                    </TableCell>
                    <TableCell className="h-10 max-w-40 border border-gray-300 text-center">
                      {student.technology}
                    </TableCell>
                    <TableCell className="h-10 max-w-40 border border-gray-300 text-center">
                      {student.geography}
                    </TableCell>
                    <TableCell className="h-10 max-w-40 border border-gray-300 text-center">
                      {student.physical_education}
                    </TableCell>
                    <TableCell className="h-10 max-w-40 border border-gray-300 text-center">
                      {student.music}
                    </TableCell>
                    <TableCell className="h-10 max-w-40 border border-gray-300 text-center font-bold">
                      {student.art}
                    </TableCell>
                    <TableCell className="h-10 max-w-40 border border-gray-300 text-center font-bold">
                      {student.GPA}
                    </TableCell>
                    <TableCell
                      className={`h-10 max-w-40 border border-gray-300 text-center font-medium ${getAcademicPerformanceColor(
                        student.academic_performance,
                      )}`}
                    >
                      {student.academic_performance}
                    </TableCell>
                    <TableCell className="h-10 max-w-40 border border-gray-300 text-center">
                      {student.conduct}
                    </TableCell>
                    <TableCell className="h-10 max-w-40 border border-gray-300 text-center font-bold">
                      {student.rank}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={17}
                    className="py-8 text-center text-xl text-gray-500"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="bg-gray-50 p-4">
        <h3 className="font-bold text-gray-700">Chú thích:</h3>
        <p className="text-gray-600">TBCM: Trung bình các môn</p>
        <div className="mt-2 flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 bg-green-100"></div>
            <span>Giỏi</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 bg-blue-100"></div>
            <span>Khá</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 bg-yellow-100"></div>
            <span>Trung bình</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 bg-red-100"></div>
            <span>Yếu</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
