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
import { useStudents } from "@/services/student/queries";
import StudentTableHeader from "./StudentTableHeader";
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
import { formatDateString } from "@/helpers/formatDate";
import { useLayout } from "@/layouts/DefaultLayout/DefaultLayout";
import { cleanString } from "@/helpers/removeWhiteSpace";

export default function StudentTable() {
  const { currentYear } = useLayout();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [filter, setFilter] = useState({
    page: 1,
    pageSize: 5,
    grade: "",
    className: "",
    search: "",
  });

  // Define all available columns
  const allColumns = [
    { id: "actions", label: "Thao tác", width: "100px" },
    { id: "fullName", label: "Họ và tên", width: "200px" },
    { id: "gender", label: "Giới tính", width: "120px" },
    { id: "ethnicity", label: "Dân tộc", width: "120px" },
    { id: "gradeName", label: "Khối", width: "100px" },
    { id: "className", label: "Lớp", width: "100px" },
    { id: "status", label: "Trạng thái", width: "150px" },
    { id: "dob", label: "Ngày sinh", width: "150px" },
    { id: "enrollmentType", label: "Hình thức trúng tuyển", width: "150px" },
    { id: "idcardNumber", label: "Số CCCD", width: "150px" },
    { id: "permanentAddress", label: "Địa chỉ thường trú", width: "250px" },
    { id: "religion", label: "Tôn giáo", width: "100px" },
    { id: "repeatingYear", label: "Lưu ban", width: "100px" },
    { id: "status", label: "Trạng thái", width: "150px" },
    { id: "fullNameFather", label: "Họ tên cha", width: "200px" },
    { id: "phoneNumberFather", label: "SĐT cha", width: "150px" },
    { id: "occupationFather", label: "Nghề nghiệp cha", width: "150px" },
    { id: "emailFather", label: "Email cha", width: "150px" },
    { id: "yearOfBirthFather", label: "Ngày sinh cha", width: "150px" },
    { id: "idcardNumberFather", label: "Số CCCD cha", width: "150px" },
    { id: "fullNameMother", label: "Họ tên mẹ", width: "200px" },
    { id: "phoneNumberMother", label: "SĐT mẹ", width: "150px" },
    { id: "occupationMother", label: "Nghề nghiệp mẹ", width: "150px" },
    { id: "emailMother", label: "Email mẹ", width: "150px" },
    { id: "yearOfBirthMother", label: "Ngày sinh mẹ", width: "150px" },
    { id: "idcardNumberMother", label: "Số CCCD mẹ", width: "150px" },
    { id: "fullNameGuardian", label: "Họ tên người bảo hộ", width: "200px" },
    { id: "phoneNumberGuardian", label: "SĐT người bảo hộ", width: "150px" },
    {
      id: "occupationGuardian",
      label: "Nghề nghiệp người bảo hộ",
      width: "150px",
    },
    { id: "emailGuardian", label: "Email người bảo hộ", width: "150px" },
    {
      id: "yearOfBirthGuardian",
      label: "Ngày sinh người bảo hộ",
      width: "150px",
    },
    {
      id: "idcardNumberGuardian",
      label: "Số CCCD người bảo hộ",
      width: "150px",
    },
  ];

  // Initialize with all columns visible
  const [visibleColumns, setVisibleColumns] = useState(
    allColumns.map((col) => ({ id: col.id, label: col.label })),
  );

  const { data, isPending, error, isError } = useStudents(
    currentYear?.academicYearID,
  );

  //phan trang
  const { page, pageSize, grade, className, search } = filter;

  const filteredData =
    data?.students?.filter((student) => {
      // Filter by grade
      if (grade && student.gradeId != grade) {
        return false;
      }

      // Filter by class
      if (className && student.className != className) {
        return false;
      }

      // Filter by search term (case insensitive)
      if (search) {
        const searchLower = cleanString(search.toLowerCase());
        return student.fullName?.toLowerCase().includes(searchLower);
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
      "studentTableVisibleColumns",
      JSON.stringify(visibleColumns),
    );
  }, [visibleColumns]);

  // Load visible columns from localStorage on component mount
  useEffect(() => {
    const savedColumns = localStorage.getItem("studentTableVisibleColumns");
    if (savedColumns) {
      setVisibleColumns(JSON.parse(savedColumns));
    }
  }, []);

  if (isPending) {
    return (
      <Card className="relative mt-6 flex min-h-[550px] items-center justify-center p-4">
        <Spinner size="medium" />
      </Card>
    );
  }

  if (isError) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-red-500">
        <h3 className="font-bold">Đã xảy ra lỗi:</h3>
        <p>{error.message || "Không thể tải dữ liệu học sinh"}</p>
        <button
          onClick={() => queryClient.invalidateQueries(["students"])}
          className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <StudentTableHeader
        setFilter={setFilter}
        type="student"
        setVisibleColumns={setVisibleColumns}
        visibleColumns={visibleColumns}
        columns={allColumns}
        data={data?.students}
      />

      <Card className="max-h-[400px] overflow-auto border border-gray-200">
        <div className="min-w-max">
          <div>
            <Table className="w-full border-collapse">
              <TableHeader className="bg-gray-100">
                <TableRow>
                  {allColumns.map(
                    (column) =>
                      visibleColumns.some((col) => col.id === column.id) && (
                        <TableHead
                          key={column.id}
                          className={`w-[${column.width}] border border-gray-300 text-center`}
                        >
                          {column.label}
                        </TableHead>
                      ),
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData && currentData.length > 0 ? (
                  currentData?.map((student) => (
                    <TableRow
                      key={student.studentId}
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
                                    `/student/profile/${student.studentId}`,
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
                          {student.fullName}
                        </TableCell>
                      )}

                      {visibleColumns.some((col) => col.id === "gender") && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.gender}
                        </TableCell>
                      )}

                      {visibleColumns.some((col) => col.id === "ethnicity") && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.ethnicity}
                        </TableCell>
                      )}

                      {visibleColumns.some((col) => col.id === "gradeName") && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.gradeName}
                        </TableCell>
                      )}

                      {visibleColumns.some((col) => col.id === "className") && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.className}
                        </TableCell>
                      )}

                      {visibleColumns.some((col) => col.id === "status") && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.status}
                        </TableCell>
                      )}

                      {visibleColumns.some((col) => col.id === "dob") && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {formatDateString(student.dob)}
                        </TableCell>
                      )}

                      {visibleColumns.some(
                        (col) => col.id === "enrollmentType",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.enrollmentType}
                        </TableCell>
                      )}
                      {visibleColumns.some(
                        (col) => col.id === "idcardNumber",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.idcardNumber}
                        </TableCell>
                      )}
                      {visibleColumns.some(
                        (col) => col.id === "permanentAddress",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.permanentAddress}
                        </TableCell>
                      )}
                      {visibleColumns.some((col) => col.id === "religion") && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.religion}
                        </TableCell>
                      )}
                      {visibleColumns.some(
                        (col) => col.id === "repeatingYear",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.repeatingYear === true ? "Có" : "Không"}
                        </TableCell>
                      )}
                      {visibleColumns.some((col) => col.id === "status") && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.status}
                        </TableCell>
                      )}
                      {visibleColumns.some(
                        (col) => col.id === "fullNameFather",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.fullNameFather || "-"}
                        </TableCell>
                      )}

                      {visibleColumns.some(
                        (col) => col.id === "phoneNumberFather",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.phoneNumberFather || "-"}
                        </TableCell>
                      )}

                      {visibleColumns.some(
                        (col) => col.id === "occupationFather",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.occupationFather || "-"}
                        </TableCell>
                      )}
                      {visibleColumns.some(
                        (col) => col.id === "emailFather",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.emailFather || "-"}
                        </TableCell>
                      )}
                      {visibleColumns.some(
                        (col) => col.id === "yearOfBirthFather",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.yearOfBirthFather || "-"}
                        </TableCell>
                      )}
                      {visibleColumns.some(
                        (col) => col.id === "idcardNumberFather",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.idcardNumberFather || "-"}
                        </TableCell>
                      )}

                      {visibleColumns.some(
                        (col) => col.id === "fullNameMother",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.fullNameMother || "-"}
                        </TableCell>
                      )}

                      {visibleColumns.some(
                        (col) => col.id === "phoneNumberMother",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.phoneNumberMother || "-"}
                        </TableCell>
                      )}

                      {visibleColumns.some(
                        (col) => col.id === "occupationMother",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.occupationMother || "-"}
                        </TableCell>
                      )}
                      {visibleColumns.some(
                        (col) => col.id === "emailMother",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.emailMother || "-"}
                        </TableCell>
                      )}
                      {visibleColumns.some(
                        (col) => col.id === "yearOfBirthMother",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.yearOfBirthMother || "-"}
                        </TableCell>
                      )}
                      {visibleColumns.some(
                        (col) => col.id === "idcardNumberMother",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.idcardNumberMother || "-"}
                        </TableCell>
                      )}
                      {visibleColumns.some(
                        (col) => col.id === "fullNameGuardian",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.fullNameGuardian || "-"}
                        </TableCell>
                      )}

                      {visibleColumns.some(
                        (col) => col.id === "phoneNumberGuardian",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.phoneNumberGuardian || "-"}
                        </TableCell>
                      )}

                      {visibleColumns.some(
                        (col) => col.id === "occupationGuardian",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.occupationGuardian || "-"}
                        </TableCell>
                      )}
                      {visibleColumns.some(
                        (col) => col.id === "emailGuardian",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.emailGuardian || "-"}
                        </TableCell>
                      )}
                      {visibleColumns.some(
                        (col) => col.id === "yearOfBirthGuardian",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.yearOfBirthGuardian || "-"}
                        </TableCell>
                      )}
                      {visibleColumns.some(
                        (col) => col.id === "idcardNumberGuardian",
                      ) && (
                        <TableCell className="h-16 border border-gray-300 text-center">
                          {student.parent?.idcardNumberGuardian || "-"}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumns.length}
                      className="p-4 text-left"
                    >
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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
    </div>
  );
}
