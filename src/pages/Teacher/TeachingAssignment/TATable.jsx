import { useEffect, useState } from "react";
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

import { Spinner } from "@/components/Spinner";
import TAModal from "./TAModal";
import { useLayout } from "@/layouts/DefaultLayout/DefaultLayout";
import {
  useClasses,
  useSemestersByAcademicYear,
} from "@/services/common/queries";
import { cn } from "@/lib/utils";
import {
  useHomeroomTeachers,
  useSubjectConfigue,
  useTA,
} from "@/services/principal/queries";
import MyPagination from "@/components/MyPagination";
import PaginationControls from "@/components/PaginationControls";
import { Settings, Trash2 } from "lucide-react";
import UpdateTAModal from "./UpdateTAModal";
import { useDeleteTeachingAssignment } from "@/services/principal/mutation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTeachers } from "@/services/teacher/queries";

export default function TATable() {
  const [filter, setFilter] = useState({
    page: 1,
    pageSize: 5,
    teacher: null,
  });
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const { currentYear } = useLayout();
  const semesterQuery = useSemestersByAcademicYear(currentYear?.academicYearID);
  const semesters = semesterQuery.data || [];
  const [semester, setSemester] = useState(null);
  const TAQuery = useTA(semester?.semesterID);
  const classQuery = useClasses();
  const subjectConfigQuery = useSubjectConfigue();
  const deleteTeachingAssignmentMutation = useDeleteTeachingAssignment();
  const teacherQuery = useTeachers();
  const teachers = teacherQuery.data?.teachers || [];
  const teacherHomeRoomQuery = useHomeroomTeachers();
  const teacherHomeRooms = teacherHomeRoomQuery.data || [];
  // console.log(subjectConfigQuery.data);
  // console.log(TAQuery.data);
  // console.log(classQuery.data);

  const { data = [], isPending, error, isError, isFetching } = TAQuery;

  const [openModal, setOpenModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  const handleDeleteTeacher = (teacherId) => {
    console.log(`Xoá giáo viên có ID: ${teacherId}`);
    deleteTeachingAssignmentMutation.mutate({
      teacherId,
      semesterId: semester?.semesterID,
    });
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    if (semesters?.length > 0) {
      setSemester(semesters[0]);
    }
  }, [semesters, currentYear]);

  const groupedData = teachers?.map((teacher) => {
    // Get all assignments for this teacher
    const assignments = data.filter(
      (item) => item.teacherId === teacher.teacherId,
    );

    // Group assignments by subject
    const subjects = {};
    assignments.forEach((curr) => {
      if (!subjects[curr.subjectName]) {
        subjects[curr.subjectName] = {
          subjectName: curr.subjectName,
          subjectId: curr.subjectId,
          classes: [],
          semesters: new Set(),
        };
      }
      subjects[curr.subjectName].classes.push(curr.className);
      subjects[curr.subjectName].semesters.add(curr.semesterName);
    });

    return {
      teacherId: teacher.teacherId,
      teacherName: teacher.fullName,
      subjects,
    };
  });

  const isLoading =
    isPending ||
    classQuery.isLoading ||
    subjectConfigQuery.isLoading ||
    teacherHomeRoomQuery.isLoading ||
    teacherQuery.isLoading;
  // Tính toán hàng hiển thị

  // console.log(subjectConfigQuery.error);

  if (isLoading) {
    return (
      <Card className="relative mt-6 flex min-h-[550px] items-center justify-center p-4">
        <Spinner size="medium" />
      </Card>
    );
  }

  // if (isError) {
  //   return (
  //     <Card className="relative mt-6 flex items-center justify-center p-4">
  //       <div className="text-red-500">Lỗi khi tải dữ liệu</div>
  //     </Card>
  //   );
  // }

  const filteredGroupedData = filter.teacher
    ? groupedData.filter((t) => t.teacherId === Number(filter.teacher))
    : groupedData;

  //Phân trang
  const page = filter.page;
  const pageSize = filter.pageSize;
  const totalItems = filteredGroupedData?.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalItems);
  const paginatedTeachers = filteredGroupedData?.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <div className="relative mt-6">
      <div className="mb-4 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <h2 className="!mb-0 text-2xl font-semibold">Phân công giảng dạy</h2>
          <div className="bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-lg p-1">
            {semesters?.map((sem) => (
              <button
                key={sem.semesterID}
                className={cn(
                  // Change color for active/inactive semester
                  "ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-8 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                  semester?.semesterID === sem.semesterID
                    ? "bg-blue-600 text-white shadow-sm" // Active: blue background, white text
                    : "bg-gray-200 text-gray-700 hover:bg-blue-100", // Inactive: gray background, blue hover
                )}
                onClick={() => setSemester(sem)}
              >
                {sem.semesterName}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filter.teacher ?? ""}
            onValueChange={(value) =>
              setFilter((prev) => ({
                ...prev,
                teacher: value === "all" ? null : value,
                page: 1, // reset to first page when filter changes
              }))
            }
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Lọc theo giáo viên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
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
          <Button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 rounded-md bg-blue-600 text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
          >
            Thêm phân công giảng dạy
          </Button>
        </div>
      </div>

      {/* Add Modal */}
      <TAModal
        open={openModal}
        onOpenChange={setOpenModal}
        semester={semester}
      />

      {/* Update Modal */}
      <UpdateTAModal
        open={openUpdateModal}
        onOpenChange={(open) => {
          setOpenUpdateModal(open);
          if (!open) setSelectedTeacherId(null);
        }}
        semester={semester}
        teacherId={selectedTeacherId}
      />

      {/* Container chính không có overflow-x-auto */}
      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
            <Spinner />
          </div>
        )}

        {/* Container cho bảng với overflow-x-auto */}
        <div className="max-h-[400px] overflow-auto">
          <div className="min-w-max">
            <Table
              className="w-full border border-gray-300"
              // style={{ minWidth: "1500px" }}
            >
              <TableHeader className="bg-gray-100">
                <TableRow className="sticky top-0 z-10">
                  <TableHead className="w-10 border border-gray-300 text-center whitespace-nowrap">
                    Thao tác
                  </TableHead>
                  <TableHead className="w-50 border border-gray-300 text-center whitespace-nowrap">
                    Họ tên cán bộ
                  </TableHead>
                  <TableHead className="w-50 border border-gray-300 text-center whitespace-nowrap">
                    Môn học
                  </TableHead>
                  <TableHead className="w-40 border border-gray-300 text-center whitespace-nowrap">
                    Lớp phân công
                  </TableHead>
                  <TableHead className="w-20 border border-gray-300 text-center whitespace-nowrap">
                    Số tiết
                  </TableHead>
                  <TableHead className="w-20 border border-gray-300 text-center whitespace-nowrap">
                    Số tiết định mức
                  </TableHead>
                  <TableHead className="w-20 border border-gray-300 text-center whitespace-nowrap">
                    Trạng thái
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTeachers.map((teacher) => {
                  const subjectEntries = Object.values(teacher.subjects);
                  const isHomeroom = teacherHomeRooms.some(
                    (hr) =>
                      hr.teacherId === teacher.teacherId &&
                      hr.semesterId === semester?.semesterID,
                  );

                  if (subjectEntries.length === 0) {
                    const standardPeriods = isHomeroom ? 19 - 4 : 19;
                    return (
                      <TableRow key={teacher.teacherId + "_no_assignment"}>
                        <TableCell className="h-14 border border-gray-300 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                setTeacherToDelete(teacher);
                                setShowDeleteConfirm(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedTeacherId(teacher.teacherId);
                                setOpenUpdateModal(true);
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="h-14 border border-gray-300 text-center whitespace-nowrap">
                          {teacher.teacherName}
                        </TableCell>
                        <TableCell className="h-14 border border-gray-300 text-center whitespace-nowrap">
                          {/* Môn học */}
                        </TableCell>
                        <TableCell className="h-14 border border-gray-300 text-center whitespace-nowrap">
                          {/* Lớp phân công */}
                        </TableCell>
                        <TableCell className="h-14 border border-gray-300 text-center whitespace-nowrap">
                          0
                        </TableCell>
                        <TableCell className="h-14 border border-gray-300 text-center whitespace-nowrap">
                          {standardPeriods}
                        </TableCell>
                        <TableCell className="h-14 border border-gray-300 text-center whitespace-nowrap">
                          Thiếu
                        </TableCell>
                      </TableRow>
                    );
                  }

                  // Calculate total assigned periods for the teacher (all subjects)
                  let totalAssignedPeriods = 0;
                  subjectEntries.forEach((subject) => {
                    const classInfoArr = subject.classes.map((className) => {
                      const classObj = classQuery.data?.find(
                        (cls) => cls.className === className,
                      );
                      return classObj
                        ? {
                            className: classObj.className,
                            gradeLevelId: classObj.gradeLevelId,
                          }
                        : { className, gradeLevelId: 0 };
                    });

                    let totalHKI = 0;
                    let totalHKII = 0;
                    classInfoArr.forEach(({ gradeLevelId }) => {
                      const subjectConfig = subjectConfigQuery.data?.find(
                        (cfg) =>
                          cfg.subjectId === subject.subjectId &&
                          cfg.gradeLevelId === gradeLevelId,
                      );
                      if (subjectConfig) {
                        totalHKI +=
                          Number(subjectConfig.periodsPerWeekHKI) || 0;
                        totalHKII +=
                          Number(subjectConfig.periodsPerWeekHKII) || 0;
                      }
                    });

                    if (semester?.semesterName === "Học kỳ 1") {
                      totalAssignedPeriods += totalHKI;
                    } else if (semester?.semesterName === "Học kỳ 2") {
                      totalAssignedPeriods += totalHKII;
                    }
                  });

                  const standardPeriods = isHomeroom ? 19 - 4 : 19;
                  let status = "";
                  if (totalAssignedPeriods > standardPeriods) {
                    status = "Thừa";
                  } else if (totalAssignedPeriods < standardPeriods) {
                    status = "Thiếu";
                  } else {
                    status = "Đủ";
                  }

                  return subjectEntries.map((subject, idx) => {
                    // Build an array of { className, gradeLevelId }
                    const classInfoArr = subject.classes
                      .map((className) => {
                        const classObj = classQuery.data?.find(
                          (cls) => cls.className === className,
                        );
                        return classObj
                          ? {
                              className: classObj.className,
                              gradeLevelId: classObj.gradeLevelId,
                            }
                          : { className, gradeLevelId: 0 };
                      })
                      .sort((a, b) => {
                        if (a.gradeLevelId !== b.gradeLevelId) {
                          return a.gradeLevelId - b.gradeLevelId;
                        }
                        return a.className.localeCompare(b.className, "vi");
                      });

                    const sortedClassNames = classInfoArr.map(
                      (c) => c.className,
                    );

                    return (
                      <TableRow key={teacher.teacherName + subject.subjectName}>
                        {idx === 0 && (
                          <TableCell
                            rowSpan={subjectEntries.length}
                            className="h-14 border border-gray-300 text-center whitespace-nowrap"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => {
                                  setTeacherToDelete(teacher);
                                  setShowDeleteConfirm(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedTeacherId(teacher.teacherId);
                                  setOpenUpdateModal(true);
                                }}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                        {idx === 0 && (
                          <TableCell
                            rowSpan={subjectEntries.length}
                            className="h-14 border border-gray-300 text-center whitespace-nowrap"
                          >
                            {teacher.teacherName}
                          </TableCell>
                        )}
                        <TableCell className="h-14 border border-gray-300 text-center whitespace-nowrap">
                          {subject.subjectName}
                        </TableCell>
                        <TableCell className="h-14 border border-gray-300 text-center whitespace-nowrap">
                          {sortedClassNames.join(", ")}
                        </TableCell>
                        {idx === 0 && (
                          <>
                            <TableCell
                              rowSpan={subjectEntries.length}
                              className="h-14 border border-gray-300 text-center whitespace-nowrap"
                            >
                              {totalAssignedPeriods}
                            </TableCell>
                            <TableCell
                              rowSpan={subjectEntries.length}
                              className="h-14 border border-gray-300 text-center whitespace-nowrap"
                            >
                              {standardPeriods}
                            </TableCell>
                            <TableCell
                              rowSpan={subjectEntries.length}
                              className="h-14 border border-gray-300 text-center whitespace-nowrap"
                            >
                              {status}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  });
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <PaginationControls
            pageSize={pageSize}
            setFilter={setFilter}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
          />

          <MyPagination
            totalPages={totalPages}
            currentPage={page}
            onPageChange={setFilter}
          />
        </div>
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Xác nhận xoá phân công
              </DialogTitle>
            </DialogHeader>
            <div className="mt-2">
              Bạn có chắc chắn muốn xoá toàn bộ phân công của giáo viên{" "}
              <span className="font-semibold">
                {teacherToDelete?.teacherName}
              </span>{" "}
              không?
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (teacherToDelete) {
                    handleDeleteTeacher(teacherToDelete.teacherId);
                  }
                  setShowDeleteConfirm(false);
                  setTeacherToDelete(null);
                }}
              >
                Xoá
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
