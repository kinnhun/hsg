import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useTeacherSubjects } from "@/services/principal/queries";
import { Button } from "@/components/ui/button";
import { Settings, Trash2 } from "lucide-react";
import UpdateTeacherSubjectModal from "./UpdateTeacherSubjectModal";
import PaginationControls from "@/components/PaginationControls";
import MyPagination from "@/components/MyPagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useDeleteTeacherSubject } from "@/services/principal/mutation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-56 animate-pulse rounded bg-gray-200" />
      </TableCell>
      <TableCell>
        <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-gray-200" />
      </TableCell>
    </TableRow>
  );
}

export default function SubjectConfigForTeacher() {
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const deleteTeacherSubjectsMutation = useDeleteTeacherSubject();

  const teacherSubjectQuery = useTeacherSubjects();
  const teachers = teacherSubjectQuery.data?.teachers || [];

  const [filter, setFilter] = useState({
    page: 1,
    pageSize: 5,
    teacher: null,
  });

  const filteredData = filter.teacher
    ? teachers.filter((t) => t.teacherId === Number(filter.teacher))
    : teachers;

  const { page, pageSize } = filter;

  const totalPages = Math.ceil(filteredData?.length / pageSize);
  const currentData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const startIndex = filteredData.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, filteredData.length);

  return (
    <div className="py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Cấu hình môn học cho giáo viên</h2>
        <div className="flex items-center gap-2">
          <Select
            value={filter.teacher ?? "all"}
            onValueChange={(value) =>
              setFilter((prev) => ({
                ...prev,
                teacher: value === "all" ? null : value,
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Lọc theo giáo viên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả giáo viên</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem
                  value={teacher.teacherId + ""}
                  key={teacher.teacherId}
                >
                  {teacher.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-600">
        <span>
          Môn học có dấu
          <span className="font-bold text-red-500"> *</span> là môn dạy chính
        </span>
      </div>

      <Card className="mt-4 mb-6 overflow-hidden border border-gray-200 shadow">
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-auto">
            <Table className="w-full table-fixed border-collapse">
              <TableHeader className="bg-slate-100">
                <TableRow>
                  <TableHead className="w-16 border border-gray-200 text-center">
                    STT
                  </TableHead>
                  <TableHead className="w-96 border border-gray-200">
                    Giáo viên
                  </TableHead>
                  <TableHead className="border border-gray-200">
                    Môn học có thể dạy
                  </TableHead>
                  <TableHead className="w-32 border border-gray-200 text-center">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherSubjectQuery.isLoading ? (
                  Array.from({ length: filter.pageSize }).map((_, idx) => (
                    <SkeletonRow key={idx} />
                  ))
                ) : currentData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-gray-400"
                    >
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((teacher, idx) => (
                    <TableRow
                      key={teacher.teacherId}
                      className="border-b border-gray-200"
                    >
                      <TableCell className="border border-gray-200 text-center">
                        {idx + 1 + (page - 1) * pageSize}
                      </TableCell>
                      <TableCell className="border border-gray-200">
                        {teacher.fullName}
                      </TableCell>
                      <TableCell className="border border-gray-200">
                        {teacher?.subjects
                          ?.slice()
                          .sort(
                            (a, b) =>
                              (b.isMainSubject ? 1 : 0) -
                              (a.isMainSubject ? 1 : 0),
                          )
                          .map((t, i, arr) => (
                            <span key={t.subjectId || i}>
                              {t.subjectName}
                              {t.isMainSubject && (
                                <span className="font-bold text-red-500">
                                  *
                                </span>
                              )}
                              {i < arr.length - 1 && ", "}
                            </span>
                          ))}
                      </TableCell>
                      <TableCell className="flex items-center gap-2 border border-gray-200 text-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-blue-400 hover:bg-blue-50"
                          onClick={() => {
                            setOpenUpdateModal(true);
                            setSelectedTeacher(teacher.teacherId);
                          }}
                        >
                          <Settings className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => {
                            setTeacherToDelete(teacher.teacherId);
                            setOpenDeleteModal(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UpdateTeacherSubjectModal
        open={openUpdateModal}
        onClose={(open) => {
          setOpenUpdateModal(open);
          if (!open) setSelectedTeacher(null);
        }}
        teacherId={selectedTeacher}
      />

      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xoá</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xoá tất cả môn học của giáo viên này không?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button variant="outline">Huỷ</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (teacherToDelete) {
                  deleteTeacherSubjectsMutation.mutate(teacherToDelete, {
                    onSuccess: () => {
                      setOpenDeleteModal(false);
                      setTeacherToDelete(null);
                    },
                    onError: () => {
                      // Có thể show toast lỗi nếu muốn
                    },
                  });
                }
              }}
            >
              Xoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <PaginationControls
          pageSize={pageSize}
          setFilter={setFilter}
          totalItems={filteredData?.length || 0}
          startIndex={startIndex}
          endIndex={endIndex}
        />

        <MyPagination
          totalPages={totalPages}
          currentPage={page}
          onPageChange={setFilter}
        />
      </div>
    </div>
  );
}
