import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AttendanceHeader from "./AttendanceHeader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { data } from "./data";
import {
  useHomeroomTeachers,
  useTeachingAssignmentsByTeacher,
} from "@/services/principal/queries";
import { useLayout } from "@/layouts/DefaultLayout/DefaultLayout";
import {
  useClasses,
  useSemestersByAcademicYear,
} from "@/services/common/queries";
import { cn } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";
import {
  useStudentAttendances,
  useStudentByClass,
} from "@/services/teacher/queries";
import { formatDate, formatDateString } from "@/helpers/formatDate";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { vi } from "date-fns/locale";
import { useTakeAttendance } from "@/services/teacher/mutation";
import { Skeleton } from "@/components/ui/skeleton";

export default function AttendanceTable() {
  const { currentYear } = useLayout();
  const semesterQuery = useSemestersByAcademicYear(currentYear?.academicYearID);
  const semesters = semesterQuery.data;
  const [semester, setSemester] = useState(null);
  const [classroom, setClassroom] = useState("");

  const token = JSON.parse(localStorage.getItem("token"));
  const teacherId = jwtDecode(token).teacherId;
  const teachingAssignmentQuery = useTeachingAssignmentsByTeacher({
    teacherId,
    semesterId: semester?.semesterID,
  });

  const teachingAssignments = teachingAssignmentQuery.data || [];
  const classQuery = useClasses();
  const classes = classQuery.data || [];
  // const homeroomTeacherQuery = useHomeroomTeachers();
  // const homeroomTeachers = homeroomTeacherQuery.data || [];
  const studentQuery = useStudentByClass({
    classId: classroom,
    semesterId: semester?.semesterID,
  });
  const students = studentQuery.data?.students || [];

  const takeAttendanceMutation = useTakeAttendance();

  // console.log(students);
  // console.log(teachingAssignments);

  const [date, setDate] = useState(new Date());
  const [studentsData, setStudentsData] = useState([]);
  const [session, setSession] = useState("Sáng");
  const [viewMode, setViewMode] = useState("day");

  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    // Nếu là Chủ nhật (0) thì lùi về thứ 2 tuần hiện tại, còn lại lùi về thứ 2
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };
  //attendance info
  const weekStart = formatDate(getMonday(date));
  const studentAttendanceQuery = useStudentAttendances({
    teacherId: teacherId,
    classId: classroom,
    semesterId: semester?.semesterID,
    weekStart,
  });
  const studentAttendances = studentAttendanceQuery.data || [];

  const handleSubmit = () => {
    if (viewMode === "week") {
      const currentTimeGMT7 = new Date(date);

      // Lấy thứ hiện tại (0: Chủ nhật, 1: Thứ 2, ..., 6: Thứ 7)
      const todayIndex =
        currentTimeGMT7.getDay() === 0 ? 6 : currentTimeGMT7.getDay() - 1;
      const monday = getMonday(date);

      // Duyệt từ thứ 2 đến thứ 7 (hoặc đến ngày hiện tại trong tuần)
      const payload = studentsData.flatMap((student) =>
        [...Array(todayIndex + 1)].map((_, i) => {
          const day = new Date(monday);
          day.setDate(monday.getDate() + i);
          // Lấy trạng thái điểm danh của từng ngày trong tuần cho học sinh này
          const attendanceOfDay = student.attendanceByDay?.[i] || {
            status: "C",
            note: "",
          };
          return {
            studentClassId: student.studentClassId,
            date: formatDate(day),
            session: session,
            status: attendanceOfDay.status || "C",
            note: attendanceOfDay.note || "",
            studentId: student.studentId,
          };
        }),
      );
      const data = {
        weekStart: formatDate(monday),
        teacherId: +teacherId,
        semesterId: semester?.semesterID,
        classId: classroom,
        data: payload,
      };
      console.log(data);
      takeAttendanceMutation.mutate(data);
    } else {
      const monday = getMonday(date);
      const today = formatDate(date);

      const payload = studentsData.map((student) => {
        const todayAttendance = student.attendanceByDay?.find(
          (att) => att.date === today,
        ) || { status: "C", note: "" };
        return {
          studentClassId: student.studentClassId,
          date: today,
          session: session,
          status: todayAttendance.status || "C",
          note: todayAttendance.note || "",
          studentId: student.studentId,
        };
      });
      const data = {
        weekStart: formatDate(monday),
        teacherId: +teacherId,
        semesterId: semester?.semesterID,
        classId: classroom,
        data: payload,
      };
      console.log(data);
      takeAttendanceMutation.mutate(data);
    }
  };

  // console.log(studentsData);
  useEffect(() => {
    if (semesters?.length > 0) {
      const now = new Date();
      const found = semesters.find(
        (sem) => new Date(sem.startDate) <= now && now <= new Date(sem.endDate),
      );
      setSemester(found || semesters[0]);
    }
  }, [semesters, currentYear]);

  useEffect(() => {
    if (students.length > 0) {
      // Lấy ngày thứ 2 của tuần hiện tại
      const monday = getMonday(date);
      // Tạo mảng ngày trong tuần (7 ngày)
      const weekDates = [...Array(7)].map((_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return formatDate(d);
      });

      setStudentsData(
        students.map((student) => {
          // Tạo mảng trạng thái cho từng ngày trong tuần
          const attendanceByDay = weekDates.map((day, idx) => {
            // Tìm attendance phù hợp trong studentAttendances
            const att = studentAttendances.find(
              (a) =>
                a.studentClassId === student.studentClassId &&
                a.date === day &&
                a.session === session,
            );
            return {
              status: att ? att.status : "C",
              note: att ? att.note : "",
              attendanceId: att ? att.attendanceId : null,
              date: day,
            };
          });
          return {
            ...student,
            attendanceByDay, // mảng 7 phần tử cho từng ngày
          };
        }),
      );
    } else {
      setStudentsData([]);
    }
  }, [students, studentAttendances, date, session]);

  // console.log(students);

  const debounceTimeout = useRef({});

  // Debounce cho lý do
  // const handleNoteChangeDebounced = useCallback((studentId, value) => {
  //   if (debounceTimeout.current[studentId]) {
  //     clearTimeout(debounceTimeout.current[studentId]);
  //   }
  //   debounceTimeout.current[studentId] = setTimeout(() => {
  //     setStudentsData((prev) =>
  //       prev.map((s) =>
  //         s.studentId === studentId ? { ...s, note: value } : s,
  //       ),
  //     );
  //   }, 300);
  // }, []);

  // const handleStatusChange = (studentId, value) => {
  //   setStudentsData((prev) =>
  //     prev.map((s) =>
  //       s.studentId === studentId ? { ...s, status: value } : s,
  //     ),
  //   );
  // };

  const handleWeekStatusInputChange = (studentId, dayIndex, value) => {
    setStudentsData((prev) =>
      prev.map((student) =>
        student.studentId === studentId
          ? {
              ...student,
              attendanceByDay: student.attendanceByDay.map((att, idx) =>
                idx === dayIndex
                  ? { ...att, status: value.toUpperCase() }
                  : att,
              ),
            }
          : student,
      ),
    );
  };

  const isLoading =
    studentQuery.isLoading ||
    studentAttendanceQuery.isLoading ||
    teachingAssignmentQuery.isLoading ||
    classQuery.isLoading;

  return (
    <div className="mt-6 p-4">
      <div className="flex items-center">
        <div>
          {" "}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {date ? (
                  formatDateString(formatDate(date))
                ) : (
                  <span className="text-gray-400">Chọn ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={vi}
                disabled={
                  (date) =>
                    date > new Date() ||
                    date < new Date("1900-01-01") ||
                    date.getDay() === 0 // Không cho chọn Chủ nhật
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="ml-4">
          <Select value={classroom} onValueChange={setClassroom}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn lớp" />
            </SelectTrigger>
            <SelectContent>
              {classes
                .filter((c) => {
                  const inTeaching = teachingAssignments.some(
                    (ta) => ta.classId === c.classId,
                  );
                  // const inHomeroom = homeroomTeachers.some(
                  //   (ht) =>
                  //     ht.classId === c.classId &&
                  //     ht.teacherId == teacherId &&
                  //     semester?.semesterID === ht.semesterId,
                  // );
                  // return inTeaching || inHomeroom;
                  return inTeaching;
                })
                .map((c) => (
                  <SelectItem key={c.classId} value={c.classId}>
                    {c.className}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-4">
          <Select value={session} onValueChange={setSession}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn buổi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sáng">Buổi sáng</SelectItem>
              <SelectItem value="Chiều">Buổi chiều</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="bg-muted text-muted-foreground ml-auto inline-flex h-10 items-center justify-center rounded-lg">
          {semesters?.map((sem) => (
            <button
              key={sem.semesterID}
              className={cn(
                "ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-8 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                semester?.semesterID === sem.semesterID
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-100",
              )}
              onClick={() => {
                setSemester(sem);
                setClassroom("");
              }}
            >
              {sem.semesterName}
            </button>
          ))}
        </div>

        {/* Dropdown chọn chế độ xem */}
        <div className="ml-4">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chế độ xem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Xem theo ngày</SelectItem>
              <SelectItem value="week">Xem theo tuần</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hiển thị dữ liệu phù hợp với chế độ xem */}
      <div className="relative mt-4">
        <div className="max-h-[500px] overflow-auto rounded-md border border-gray-200 shadow-sm">
          <div className="min-w-max">
            {viewMode === "day" && (
              <Table className="w-full">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="min-w-[80px] border border-gray-200 text-center font-medium text-gray-700">
                      ID
                    </TableHead>
                    <TableHead className="min-w-[200px] border border-gray-200 text-center font-medium text-gray-700">
                      Họ và Tên
                    </TableHead>
                    <TableHead className="min-w-[150px] border border-gray-200 text-center font-medium text-gray-700">
                      Trạng Thái
                    </TableHead>
                    <TableHead className="min-w-[250px] border border-gray-200 text-center font-medium text-gray-700">
                      Lí do
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? // Hiển thị skeleton loading khi đang tải dữ liệu
                      Array.from({ length: 6 }).map((_, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="h-16 border border-gray-200 text-center">
                            <Skeleton className="mx-auto h-4 w-8" />
                          </TableCell>
                          <TableCell className="h-16 border border-gray-200 font-medium">
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell className="h-16 border border-gray-200 text-center">
                            <Skeleton className="mx-auto h-4 w-16" />
                          </TableCell>
                          <TableCell className="h-16 border border-gray-200">
                            <Skeleton className="h-4 w-40" />
                          </TableCell>
                        </TableRow>
                      ))
                    : studentsData.length > 0 &&
                      studentsData.map((student, index) => {
                        const today = formatDate(date);
                        const todayAttendance = student.attendanceByDay?.find(
                          (att) => att.date === today,
                        ) || { status: "C", note: "" };

                        return (
                          <TableRow
                            key={student.studentId}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="h-16 border border-gray-200 text-center">
                              {index + 1}
                            </TableCell>
                            <TableCell className="h-16 border border-gray-200 font-medium">
                              {student.fullName}
                            </TableCell>
                            <TableCell className="h-16 border border-gray-200 text-center">
                              <select
                                value={todayAttendance.status}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStudentsData((prev) =>
                                    prev.map((s) =>
                                      s.studentId === student.studentId
                                        ? {
                                            ...s,
                                            attendanceByDay:
                                              s.attendanceByDay.map((att) =>
                                                att.date === today
                                                  ? { ...att, status: val }
                                                  : att,
                                              ),
                                          }
                                        : s,
                                    ),
                                  );
                                }}
                                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="C">Có mặt</option>
                                <option value="P">Nghỉ có phép</option>
                                <option value="K">Nghỉ không phép</option>
                                <option value="X">Lí do khác</option>
                              </select>
                            </TableCell>
                            <TableCell className="h-16 border border-gray-200">
                              <Input
                                type="text"
                                value={todayAttendance.note}
                                maxLength={50}
                                disabled={todayAttendance.status !== "X"}
                                className="disabled:bg-gray-100"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStudentsData((prev) =>
                                    prev.map((s) =>
                                      s.studentId === student.studentId
                                        ? {
                                            ...s,
                                            attendanceByDay:
                                              s.attendanceByDay.map((att) =>
                                                att.date === today
                                                  ? { ...att, note: val }
                                                  : att,
                                              ),
                                          }
                                        : s,
                                    ),
                                  );
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            )}
            {viewMode === "week" && (
              <Table className="w-full">
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="text-center">STT</TableHead>
                    <TableHead className="text-center">Họ và tên</TableHead>
                    {[...Array(6)].map((_, i) => (
                      <TableHead
                        key={i}
                        className="text-center"
                      >{`Thứ ${i + 2}`}</TableHead>
                    ))}
                    <TableHead className="text-center">
                      Tổng ngày nghỉ
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsData.length > 0 &&
                    studentsData.map((student, index) => (
                      <TableRow key={student.studentId}>
                        <TableCell className="text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell>{student.fullName}</TableCell>
                        {[...Array(6)].map((_, i) => {
                          // Lấy ngày thứ i trong tuần
                          const monday = getMonday(date);
                          const day = new Date(monday);
                          day.setDate(monday.getDate() + i);
                          const today = new Date();
                          // So sánh ngày hiện tại với ngày trong tuần
                          const isFuture = day > today;
                          const value = isFuture
                            ? "K"
                            : (student.attendanceByDay?.[i]?.status ?? "");
                          return (
                            <TableCell
                              key={i}
                              className="border border-gray-300 text-center"
                            >
                              <Input
                                type="text"
                                value={value}
                                maxLength={1}
                                className="mx-auto w-[50px] text-center"
                                disabled={isFuture}
                                onInput={(e) => {
                                  const allowed = ["K", "X", "P", "C"];
                                  let val = e.target.value.toUpperCase();
                                  if (!allowed.includes(val) && val !== "") {
                                    val = "";
                                  }
                                  e.target.value = val;
                                  if (!isFuture) {
                                    handleWeekStatusInputChange(
                                      student.studentId,
                                      i,
                                      val,
                                    );
                                  }
                                }}
                                onChange={(e) =>
                                  !isFuture &&
                                  handleWeekStatusInputChange(
                                    student.studentId,
                                    i,
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                          );
                        })}
                        <TableCell className="border border-gray-300 text-center">
                          {student.attendanceByDay
                            ?.slice(0, 6)
                            .filter((d, i) => {
                              // Chỉ tính ngày đã đến
                              const monday = getMonday(date);
                              const day = new Date(monday);
                              day.setDate(monday.getDate() + i);
                              const today = new Date();
                              return day <= today && d.status !== "C";
                            }).length || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
        {/* Thanh cuộn ngang luôn hiển thị */}
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          className="min-w-[150px] bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500"
          onClick={handleSubmit}
        >
          Lưu điểm danh
        </Button>
      </div>
    </div>
  );
}
