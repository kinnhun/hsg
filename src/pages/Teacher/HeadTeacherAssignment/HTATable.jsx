import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { useHTA } from "@/services/teacher/queries";
import HTAHeader from "./HTAHeader";
import { Spinner } from "@/components/Spinner";
import PaginationControls from "@/components/PaginationControls";
import MyPagination from "@/components/MyPagination";

const teachers = [
  "Tạ Tuấn Anh",
  "Vương Thị Ngọc Anh",
  "Nguyễn Thị Chiêm",
  "Phạm Thị Duyên",
  "Phạm Công Đoàn",
  "Nguyễn Thị Đượm",
  "Phạm Thị Hải",
  "Lê Thị Hằng",
  "Nguyễn Thị Hiền",
  "Vũ Thị Thu Hoài",
  "Vũ Thị Huệ",
  "Trần Thị Lan",
  "Nguyễn Thị Huyền",
  "Nguyễn Hữu Luận",
  "Vũ Viết Lượng",
  "Trần Thị Minh Nguyệt",
  "Lê Hồng Nhung",
  "Trần Thị Tuyết Nhung",
  "Đỗ Thị Thu",
  "Phạm Thị Thuỷ",
  "Nguyễn Ngọc Trang",
  "Bùi Văn Trang",
  "Nguyễn Thành Trung",
];

export default function HTATable() {
  const [filter, setFilter] = useState({
    page: 1,
    pageSize: 5,
    grade: "",
  });

  const { data, isPending, error, isError, isFetching } = useHTA(filter);
  const { page, pageSize } = filter;

  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(
    (page - 1) * pageSize + (data?.length || 0),
    startIndex + pageSize - 1,
  );

  if (isPending) {
    return (
      <Card className="relative mt-6 flex min-h-[550px] items-center justify-center p-4">
        <Spinner size="medium" />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="relative mt-6 flex min-h-[550px] items-center justify-center p-4">
        <div className="text-red-500">Lỗi khi tải dữ liệu</div>
      </Card>
    );
  }

  return (
    <Card className="relative mt-6 p-4">
      <HTAHeader type="employees" setFilter={setFilter} />

      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
            <Spinner />
          </div>
        )}

        <div className="max-h-[400px] overflow-auto">
          <div className="min-w-max">
            <Table className="w-full border border-gray-300">
              <TableHeader className="bg-gray-100 text-white">
                <TableRow>
                  <TableHead className="h-10 border border-gray-300 text-center whitespace-nowrap">
                    STT
                  </TableHead>
                  <TableHead className="h-10 border border-gray-300 text-center whitespace-nowrap">
                    Lớp
                  </TableHead>
                  <TableHead className="h-10 border border-gray-300 text-center whitespace-nowrap">
                    Sĩ số
                  </TableHead>
                  <TableHead className="h-10 border border-gray-300 text-center whitespace-nowrap">
                    Giáo viên chủ nhiệm
                  </TableHead>
                  <TableHead className="h-10 border border-gray-300 text-center whitespace-nowrap">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  teachers?.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {classItem.id}
                      </TableCell>
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {classItem.class}
                      </TableCell>
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {classItem.student_number}
                      </TableCell>
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {classItem.head_teacher}
                      </TableCell>
                      <TableCell className="h-16 border border-gray-300 text-center">
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-blue-500 text-blue-500"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-red-500 text-red-500"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-16 text-center text-gray-500"
                    >
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between">
          <PaginationControls
            pageSize={pageSize}
            setFilter={setFilter}
            totalItems={data?.length || 0}
            startIndex={startIndex}
            endIndex={endIndex}
          />

          <MyPagination
            totalPages={6}
            currentPage={page}
            onPageChange={setFilter}
          />
        </div>
      </div>
    </Card>
  );
}
