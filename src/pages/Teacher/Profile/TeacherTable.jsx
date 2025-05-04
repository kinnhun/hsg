import { useState, useEffect } from "react";
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
import { Settings } from "lucide-react";
import MyPagination from "@/components/MyPagination";
import { useTeachers } from "@/services/teacher/queries";
import TeacherTableHeader from "./TeacherTableHeader";
import PaginationControls from "@/components/PaginationControls";
import { Spinner } from "@/components/Spinner";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router";
import { useDeleteTeacher } from "@/services/teacher/mutation";
import { formatDateString } from "@/helpers/formatDate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
// import { useLayout } from "@/layouts/DefaultLayout/DefaultLayout";

export default function TeacherTable() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // const { currentYear } = useLayout();

  const [isModalOpen, setModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  const [filter, setFilter] = useState({
    page: 1,
    pageSize: 5,
    department: "",
    contract: "",
    search: "",
  });

  // Define all available columns
  const allColumns = [
    { id: "actions", label: "Thao tác", width: "100px" },
    { id: "fullName", label: "Họ tên cán bộ", width: "200px" },
    { id: "phoneNumber", label: "Số ĐTDD", width: "150px" },
    { id: "email", label: "Địa chỉ Email", width: "200px" },
    { id: "employmentStatus", label: "Trạng thái", width: "120px" },
    { id: "dob", label: "Ngày sinh", width: "150px" },
    { id: "gender", label: "Giới tính", width: "120px" },
    { id: "ethnicity", label: "Dân tộc", width: "120px" },
    { id: "position", label: "Chức vụ", width: "150px" },
    { id: "department", label: "Tổ bộ môn", width: "150px" },
    { id: "employmentType", label: "Hình thức hợp đồng", width: "180px" },
    { id: "idcardNumber", label: "Số CCCD", width: "180px" },
    { id: "insuranceNumber", label: "Số bảo hiểm", width: "180px" },
    { id: "maritalStatus", label: "Tình trạng hôn nhân", width: "200px" },
    { id: "permanentAddress", label: "Địa chỉ thường trú", width: "180px" },
    { id: "recruitmentAgency", label: "Cơ quan tuyển dụng", width: "180px" },
    { id: "schoolJoinDate", label: "Ngày vào trường", width: "150px" },
    {
      id: "permanentEmploymentDate",
      label: "Ngày vào biên chế",
      width: "150px",
    },
    {
      id: "hiringDate",
      label: "Ngày tuyển dụng",
      width: "150px",
    },
  ];

  // Initialize with all columns visible
  const [visibleColumns, setVisibleColumns] = useState(
    allColumns.map((col) => ({ id: col.id, label: col.label })),
  );

  const { data, isPending, error, isError } = useTeachers();
  const teacherMutation = useDeleteTeacher();
  //phan trang
  const { page, pageSize, department, contract, search } = filter;

  const filteredData =
    data?.teachers?.filter((teacher) => {
      // Filter by department
      if (department && teacher.department !== department) {
        return false;
      }

      // Filter by contract type
      if (contract && teacher.employmentType !== contract) {
        return false;
      }

      // Filter by search term (case insensitive)
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          teacher.fullName?.toLowerCase().includes(searchLower) ||
          teacher.email?.toLowerCase().includes(searchLower) ||
          teacher.phoneNumber?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    }) || [];

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const currentData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const startIndex = filteredData.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, filteredData.length);

  // Save visible columns to localStorage
  useEffect(() => {
    localStorage.setItem(
      "teacherTableVisibleColumns",
      JSON.stringify(visibleColumns),
    );
  }, [visibleColumns]);

  // Load visible columns from localStorage on component mount
  useEffect(() => {
    const savedColumns = localStorage.getItem("teacherTableVisibleColumns");
    if (savedColumns) {
      setVisibleColumns(JSON.parse(savedColumns));
    }
  }, []);

  if (isPending) {
    return (
      <Card className="relative mt-6 flex min-h-[400px] items-center justify-center p-4">
        <Spinner size="medium" />
      </Card>
    );
  }

  if (isError) {
    return (
      <div className="border border-red-300 bg-red-50 p-4 text-red-500">
        <h3 className="font-bold">Đã xảy ra lỗi:</h3>
        <p>{error.message || "Không thể tải dữ liệu nhân viên"}</p>
        <button
          onClick={() => queryClient.invalidateQueries(["employees"])}
          className="mt-2 bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <TeacherTableHeader
        setFilter={setFilter}
        type="teachers"
        setVisibleColumns={setVisibleColumns}
        visibleColumns={visibleColumns}
        columns={allColumns}
        data={data?.teachers}
      />

      <Card className="max-h-[500px] overflow-auto border border-gray-200">
        <div className="min-w-max">
          <Table className="w-full border-collapse">
            <TableHeader className="bg-gray-100">
              <TableRow>
                {allColumns.map(
                  (column) =>
                    visibleColumns.some((col) => col.id === column.id) && (
                      <TableHead
                        key={column.id}
                        className={`border border-gray-300 text-center`}
                        style={{ width: column.width }}
                      >
                        {column.label}
                      </TableHead>
                    ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData && currentData.length > 0 ? (
                currentData.map((teacher) => (
                  <TableRow
                    key={teacher.teacherId}
                    className="divide-x divide-gray-300"
                  >
                    {visibleColumns.some((col) => col.id === "actions") && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(
                                  `/teacher/profile/${teacher.teacherId}`,
                                )
                              }
                            >
                              Xem hồ sơ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}

                    {visibleColumns.some((col) => col.id === "fullName") && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {teacher.fullName}
                      </TableCell>
                    )}

                    {visibleColumns.some((col) => col.id === "phoneNumber") && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {teacher.phoneNumber}
                      </TableCell>
                    )}

                    {visibleColumns.some((col) => col.id === "email") && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {teacher.email}
                      </TableCell>
                    )}

                    {visibleColumns.some(
                      (col) => col.id === "employmentStatus",
                    ) && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {teacher.employmentStatus}
                      </TableCell>
                    )}

                    {visibleColumns.some((col) => col.id === "dob") && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {formatDateString(teacher.dob)}
                      </TableCell>
                    )}

                    {visibleColumns.some((col) => col.id === "gender") && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {teacher.gender}
                      </TableCell>
                    )}

                    {visibleColumns.some((col) => col.id === "ethnicity") && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {teacher.ethnicity}
                      </TableCell>
                    )}

                    {visibleColumns.some((col) => col.id === "position") && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {teacher.position}
                      </TableCell>
                    )}

                    {visibleColumns.some((col) => col.id === "department") && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {teacher.department}
                      </TableCell>
                    )}

                    {visibleColumns.some(
                      (col) => col.id === "employmentType",
                    ) && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {teacher.employmentType}
                      </TableCell>
                    )}

                    {visibleColumns.some(
                      (col) => col.id === "idcardNumber",
                    ) && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {teacher.idcardNumber}
                      </TableCell>
                    )}

                    {visibleColumns.some(
                      (col) => col.id === "insuranceNumber",
                    ) && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {teacher.insuranceNumber}
                      </TableCell>
                    )}

                    {visibleColumns.some(
                      (col) => col.id === "maritalStatus",
                    ) && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {teacher.maritalStatus}
                      </TableCell>
                    )}

                    {visibleColumns.some(
                      (col) => col.id === "permanentAddress",
                    ) && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {teacher.permanentAddress}
                      </TableCell>
                    )}

                    {visibleColumns.some(
                      (col) => col.id === "recruitmentAgency",
                    ) && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {teacher.recruitmentAgency}
                      </TableCell>
                    )}
                    {visibleColumns.some(
                      (col) => col.id === "schoolJoinDate",
                    ) && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {formatDateString(teacher.schoolJoinDate)}
                      </TableCell>
                    )}

                    {visibleColumns.some(
                      (col) => col.id === "permanentEmploymentDate",
                    ) && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {formatDateString(teacher.permanentEmploymentDate)}
                      </TableCell>
                    )}
                    {visibleColumns.some((col) => col.id === "hiringDate") && (
                      <TableCell className="h-16 border border-gray-300 text-center">
                        {formatDateString(teacher.hiringDate)}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} className="p-4">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <PaginationControls
          pageSize={pageSize}
          setFilter={setFilter}
          totalItems={filteredData.length || 0}
          startIndex={startIndex}
          endIndex={endIndex}
        />

        <MyPagination
          totalPages={totalPages}
          currentPage={page}
          onPageChange={setFilter}
        />
      </div>

      <Dialog
        open={!!teacherToDelete}
        onOpenChange={(open) => !open && setTeacherToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa giáo viên {teacherToDelete?.fullName}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setTeacherToDelete(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                teacherMutation.mutate(teacherToDelete?.teacherId);
                setTeacherToDelete(null);
              }}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
