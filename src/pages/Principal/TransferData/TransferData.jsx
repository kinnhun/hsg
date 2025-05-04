import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useAcademicYears,
  useClasses,
  useSemestersByAcademicYear,
} from "@/services/common/queries";
import {
  useAllSemesters,
  useNonEligibleStudents,
  usePreviousYearStudents,
} from "@/services/principal/queries";
import { useLayout } from "@/layouts/DefaultLayout/DefaultLayout";
import {
  useTransferClassData,
  useTransferStudentData,
} from "@/services/principal/mutation";
import toast from "react-hot-toast";
import { useStudents } from "@/services/student/queries";
import { Spinner } from "@/components/Spinner";

export default function TransferData() {
  const tabs = [
    { label: "KẾT CHUYỂN LÊN LỚP", value: "promotion" },
    { label: "KẾT CHUYỂN LƯU BAN", value: "repeat" },
    { label: "ĐIỀU CHỈNH KẾT CHUYỂN", value: "adjust" },
  ];
  const [activeTab, setActiveTab] = useState("promotion");
  const { currentYear } = useLayout();
  const academicYearQuery = useAcademicYears();
  const academicYears = academicYearQuery.data || [];
  const sortedYears = [...academicYears].sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate),
  );
  const currentIndex = sortedYears.findIndex(
    (y) => y.academicYearID === currentYear?.academicYearID,
  );
  const previousYear = currentIndex > 0 ? sortedYears[currentIndex - 1] : null;

  const [mode, setMode] = useState("class"); // "class" hoặc "student"
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedRepeatStudents, setSelectedRepeatStudents] = useState([]);
  const [selectedAdjustStudents, setSelectedAdjustStudents] = useState([]);

  const [pendingGrade, setPendingGrade] = useState(""); // Khối chờ xác nhận
  const [confirmChangeGrade, setConfirmChangeGrade] = useState(false);
  const [pendingClassName, setPendingClassName] = useState(""); // Lớp chờ xác nhận
  const [confirmChangeClass, setConfirmChangeClass] = useState(false);

  const classQuery = useClasses();
  const classes = classQuery.data || [];
  const studentQuery = usePreviousYearStudents(currentYear?.academicYearID);
  const students = studentQuery.data?.students || [];
  const NEStudentQuery = useNonEligibleStudents(currentYear?.academicYearID);
  const NEStudents = NEStudentQuery.data || [];
  const currentStudentQuery = useStudents(currentYear?.academicYearID);
  const studentList = currentStudentQuery.data?.students || [];

  const isLoading =
    classQuery.isLoading ||
    studentQuery.isLoading ||
    NEStudentQuery.isLoading ||
    currentStudentQuery.isLoading;

  // console.log(studentList);

  const transferClassDataMutation = useTransferClassData();
  const transferStudentDataMutation = useTransferStudentData();

  // console.log(selectedRepeatStudents);

  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");

  // Xử lý chuyển dữ liệu
  const handleTransfer = () => {
    if (activeTab === "promotion") {
      if (mode === "class") {
        if (selectedClasses.length === 0) {
          toast.error("Vui lòng chọn ít nhất một lớp để chuyển");
          return;
        }
        const data = selectedClasses.map((cls) => ({
          classId: cls.classId,
          targetClassId: cls.targetClassId,
          academicYearId: previousYear?.academicYearID,
          targetAcademicYearId: currentYear?.academicYearID,
        }));
        console.log(data);
        transferClassDataMutation.mutate(data);
      }
      if (mode === "student") {
        if (selectedStudents.length === 0) {
          toast.error("Vui lòng chọn ít nhất một học sinh để chuyển");
          return;
        }
        // console.log(selectedStudents);
        const data = selectedStudents.map((student) => ({
          studentId: student.studentId,
          classId: student.toClass,
          academicYearId: currentYear?.academicYearID,
        }));
        console.log(data);
        transferStudentDataMutation.mutate(data);
      }
    }
    if (activeTab === "repeat") {
      if (selectedRepeatStudents.length === 0) {
        toast.error("Vui lòng chọn ít nhất một học sinh để chuyển");
        return;
      }
      const data = selectedRepeatStudents.map((student) => ({
        studentId: student.studentId,
        classId: student.toClass,
        academicYearId: currentYear?.academicYearID,
      }));
      console.log(data);
      transferStudentDataMutation.mutate(data);
    }
    if (activeTab === "adjust") {
      if (selectedAdjustStudents.length === 0) {
        toast.error("Vui lòng chọn ít nhất một học sinh để chuyển");
        return;
      }
      const data = selectedAdjustStudents.map((student) => ({
        studentId: student.studentId,
        classId: student.toClass,
        academicYearId: currentYear?.academicYearID,
      }));
      console.log(data);
      transferStudentDataMutation.mutate(data);
    }
  };

  // console.log(currentYear);

  // console.log(selectedAdjustStudents);

  // console.log(className);
  // console.log(classes);
  // UI loading skeleton
  // if (classQuery.isLoading) {
  //   return (
  //     <Card className="mt-6 border shadow">
  //       <CardHeader>
  //         <CardTitle className="text-2xl font-bold">
  //           Chuyển dữ liệu học sinh
  //         </CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <Skeleton className="mb-4 h-10 w-1/3" />
  //         <Skeleton className="mb-2 h-8 w-full" />
  //         <Skeleton className="mb-2 h-8 w-full" />
  //         <Skeleton className="h-8 w-full" />
  //       </CardContent>
  //     </Card>
  //   );
  // }
  if (isLoading) {
    return <Spinner />;
  }
  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold">
        Chuyển dữ liệu học sinh qua năm mới
      </h2>
      <div className="my-4 inline-flex rounded-xl bg-gray-50 p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.value
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab(tab.value);
              setGrade("");
              setClassName("");
              setSelectedClasses([]);
              setSelectedStudents([]);
              setSelectedRepeatStudents([]);
              setSelectedAdjustStudents([]);
            }}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-4">
        {activeTab === "promotion" && (
          <Select
            value={mode}
            onValueChange={(val) => {
              setMode(val);
              setGrade("");
              setClassName("");
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Chọn chế độ chuyển" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="class">Chuyển cả lớp</SelectItem>
              <SelectItem value="student">Chuyển lẻ học sinh</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select
          value={grade}
          onValueChange={(val) => {
            if (
              (mode === "class" && selectedClasses.length > 0) ||
              (mode === "student" && selectedStudents.length > 0) ||
              (activeTab === "repeat" && selectedRepeatStudents.length > 0) ||
              (activeTab === "adjust" && selectedAdjustStudents.length > 0)
            ) {
              setPendingGrade(val);
              setConfirmChangeGrade(true);
            } else {
              setGrade(val);
              setClassName("");
              setSelectedClasses([]);
              setSelectedStudents([]);
              setSelectedRepeatStudents([]);
              setSelectedAdjustStudents([]);
            }
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Chọn khối" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">Khối 6</SelectItem>
            <SelectItem value="7">Khối 7</SelectItem>
            <SelectItem value="8">Khối 8</SelectItem>
            {}
            <SelectItem value="9">Khối 9</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={className}
          onValueChange={(val) => {
            if (
              (mode === "student" && selectedStudents.length > 0) ||
              (mode === "repeat" && selectedRepeatStudents.length > 0) ||
              (activeTab === "adjust" && selectedAdjustStudents.length > 0) ||
              (activeTab === "repeat" && selectedRepeatStudents.length > 0)
            ) {
              setPendingClassName(val);
              setConfirmChangeClass(true);
            } else {
              setClassName(val);
              setSelectedStudents([]);
              setSelectedRepeatStudents([]);
              setSelectedAdjustStudents([]);
            }
          }}
          disabled={(activeTab === "promotion" && mode === "class") || !grade}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Chọn lớp" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((item) => {
              if (item.className[0] == grade) {
                return (
                  <SelectItem key={item.classId} value={item.className}>
                    {item.className}
                  </SelectItem>
                );
              }
            })}
          </SelectContent>
        </Select>
        <Button
          onClick={handleTransfer}
          className="ml-auto cursor-pointer bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700"
        >
          Thực hiện chuyển dữ liệu
        </Button>
      </div>

      {activeTab === "promotion" && (
        <>
          {mode === "class" && grade && (
            <div className="mt-4">
              <p className="font-semibold">Danh sách các lớp</p>
              <Card className="mt-4 border shadow">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 text-center">
                          <Checkbox
                            checked={
                              classes.filter((c) => c.className[0] == grade)
                                .length > 0 &&
                              selectedClasses.length ===
                                classes.filter((c) => c.className[0] == grade)
                                  .length
                            }
                            indeterminate={
                              selectedClasses.length > 0 &&
                              selectedClasses.length <
                                classes.filter((c) => c.className[0] == grade)
                                  .length
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedClasses(
                                  classes
                                    .filter((c) => c.className[0] == grade)
                                    .map((cls) => ({
                                      classId: cls.classId,
                                      targetClassId: "",
                                    })),
                                );
                              } else {
                                setSelectedClasses([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead className="w-50 text-center">STT</TableHead>
                        <TableHead className="w-50 text-center">
                          Lớp hiện tại
                        </TableHead>
                        <TableHead className="w-50 text-center">
                          Số học sinh
                        </TableHead>
                        <TableHead className="w-auto">Lớp chuyển đến</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.length === 0 ? (
                        <TableRow className="p-4 text-gray-500">
                          <TableCell colSpan={5}>
                            Không có dữ liệu học sinh năm trước đó, vui lòng
                            chọn năm mới
                          </TableCell>
                        </TableRow>
                      ) : (
                        classes
                          .filter((c) => c.className[0] == grade)
                          .map((cls, idx) => (
                            <TableRow key={cls.classId}>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={selectedClasses.some(
                                    (s) => s.classId === cls.classId,
                                  )}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedClasses([
                                        ...selectedClasses,
                                        {
                                          classId: cls.classId,
                                          targetClassId: "",
                                        },
                                      ]);
                                    } else {
                                      setSelectedClasses(
                                        selectedClasses.filter(
                                          (s) => s.classId !== cls.classId,
                                        ),
                                      );
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                {idx + 1}
                              </TableCell>
                              <TableCell className="text-center">
                                {cls.className}
                              </TableCell>
                              <TableCell className="text-center">
                                {
                                  students?.filter(
                                    (s) => s.className == cls.className,
                                  ).length
                                }
                              </TableCell>
                              <TableCell className="text-center">
                                <Select
                                  value={
                                    selectedClasses.find(
                                      (s) => s.classId === cls.classId,
                                    )?.targetClassId || ""
                                  }
                                  onValueChange={(val) => {
                                    setSelectedClasses((prev) =>
                                      prev.map((s) =>
                                        s.classId === cls.classId
                                          ? { ...s, targetClassId: val }
                                          : s,
                                      ),
                                    );
                                  }}
                                  disabled={
                                    !selectedClasses.some(
                                      (s) => s.classId === cls.classId,
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Chọn lớp" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {classes
                                      .filter(
                                        (c) =>
                                          c.className[0] == +grade + 1 &&
                                          c.status === "Hoạt động",
                                      )
                                      .map((c) => (
                                        <SelectItem
                                          key={c.classId}
                                          value={c.classId}
                                        >
                                          {c.className}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {mode === "student" && grade && className && (
            <div>
              <div className="mt-4 font-medium">Chọn học sinh cần chuyển:</div>
              <div className="overflow-x-auto">
                <Card className="mt-4 border shadow">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Họ và tên</TableHead>
                          <TableHead>Lớp mới</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.length === 0 ? (
                          <TableRow className="p-4 text-gray-500">
                            <TableCell colSpan={5}>
                              Không có dữ liệu học sinh năm trước đó, vui lòng
                              chọn năm mới
                            </TableCell>
                          </TableRow>
                        ) : (
                          students
                            .filter(
                              (s) =>
                                s.className === className &&
                                s.repeatingYear == false,
                            )
                            .map((student) => (
                              <TableRow key={student.studentId}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedStudents.some(
                                      (s) => s.studentId === student.studentId,
                                    )}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedStudents([
                                          ...selectedStudents,
                                          {
                                            studentId: student.studentId,
                                            classId: student.classId,
                                            toClass: "",
                                          },
                                        ]);
                                      } else {
                                        setSelectedStudents(
                                          selectedStudents.filter(
                                            (s) =>
                                              s.studentId !== student.studentId,
                                          ),
                                        );
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell>{student.studentName}</TableCell>
                                <TableCell>
                                  <Select
                                    value={
                                      selectedStudents.find(
                                        (s) =>
                                          s.studentId === student.studentId,
                                      )?.toClass || ""
                                    }
                                    onValueChange={(val) => {
                                      setSelectedStudents((prev) =>
                                        prev.map((s) =>
                                          s.studentId === student.studentId
                                            ? { ...s, toClass: val }
                                            : s,
                                        ),
                                      );
                                    }}
                                    disabled={
                                      !selectedStudents.some(
                                        (s) =>
                                          s.studentId === student.studentId,
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-[120px]">
                                      <SelectValue placeholder="Chọn lớp" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {classes
                                        .filter(
                                          (c) =>
                                            c.status === "Hoạt động" &&
                                            c.className[0] == +grade + 1,
                                        )
                                        .map((c) => (
                                          <SelectItem
                                            key={c.classId}
                                            value={c.classId}
                                          >
                                            {c.className}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "repeat" && (
        <>
          {grade && className && (
            <div>
              <div className="mt-4 font-medium">
                Chọn học sinh lưu ban cần chuyển:
              </div>
              <div className="overflow-x-auto">
                <Card className="mt-4 border shadow">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Họ và tên</TableHead>
                          <TableHead>Lớp hiện tại</TableHead>
                          <TableHead>Lớp mới</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {NEStudents.length === 0 ? (
                          <TableRow className="p-4 text-gray-500">
                            <TableCell colSpan={5}>
                              Không có dữ liệu học sinh lưu ban
                            </TableCell>
                          </TableRow>
                        ) : (
                          NEStudents.filter(
                            (s) => s.className === className,
                          ).map((student) => (
                            <TableRow key={student.studentId}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedRepeatStudents.some(
                                    (s) => s.studentId === student.studentId,
                                  )}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedRepeatStudents([
                                        ...selectedRepeatStudents,
                                        {
                                          studentId: student.studentId,
                                          classId: student.classId,
                                          toClass: "",
                                        },
                                      ]);
                                    } else {
                                      setSelectedRepeatStudents(
                                        selectedRepeatStudents.filter(
                                          (s) =>
                                            s.studentId !== student.studentId,
                                        ),
                                      );
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell>{student.studentName}</TableCell>
                              <TableCell>{student.className}</TableCell>
                              <TableCell>
                                <Select
                                  value={
                                    selectedRepeatStudents.find(
                                      (s) => s.studentId === student.studentId,
                                    )?.toClass || ""
                                  }
                                  onValueChange={(val) => {
                                    setSelectedRepeatStudents((prev) =>
                                      prev.map((s) =>
                                        s.studentId === student.studentId
                                          ? { ...s, toClass: val }
                                          : s,
                                      ),
                                    );
                                  }}
                                  disabled={
                                    !selectedRepeatStudents.some(
                                      (s) => s.studentId === student.studentId,
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Chọn lớp" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {classes
                                      .filter(
                                        (c) =>
                                          c.status === "Hoạt động" &&
                                          c.className[0] == grade, // Lưu ban thì vẫn ở lại khối cũ
                                      )
                                      .map((c) => (
                                        <SelectItem
                                          key={c.classId}
                                          value={c.classId}
                                        >
                                          {c.className}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
      {activeTab === "adjust" && (
        <>
          {grade && className && (
            <div>
              <div className="mt-4 font-medium">
                Chọn học sinh lưu ban cần chuyển:
              </div>
              <div className="overflow-x-auto">
                <Card className="mt-4 border shadow">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Họ và tên</TableHead>
                          <TableHead>Lớp hiện tại</TableHead>
                          <TableHead>Lớp mới</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentList.length === 0 ? (
                          <TableRow className="p-4 text-gray-500">
                            <TableCell colSpan={5}>
                              Không có dữ liệu học sinh lưu ban
                            </TableCell>
                          </TableRow>
                        ) : (
                          studentList
                            .filter((s) => s.className === className)
                            .map((student) => (
                              <TableRow key={student.studentId}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedAdjustStudents.some(
                                      (s) => s.studentId === student.studentId,
                                    )}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedAdjustStudents([
                                          ...selectedAdjustStudents,
                                          {
                                            studentId: student.studentId,
                                            classId: student.classId,
                                            toClass: "",
                                          },
                                        ]);
                                      } else {
                                        setSelectedAdjustStudents(
                                          selectedAdjustStudents.filter(
                                            (s) =>
                                              s.studentId !== student.studentId,
                                          ),
                                        );
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell>{student.fullName}</TableCell>
                                <TableCell>{student.className}</TableCell>
                                <TableCell>
                                  <Select
                                    value={
                                      selectedAdjustStudents.find(
                                        (s) =>
                                          s.studentId === student.studentId,
                                      )?.toClass || ""
                                    }
                                    onValueChange={(val) => {
                                      setSelectedAdjustStudents((prev) =>
                                        prev.map((s) =>
                                          s.studentId === student.studentId
                                            ? { ...s, toClass: val }
                                            : s,
                                        ),
                                      );
                                    }}
                                    disabled={
                                      !selectedAdjustStudents.some(
                                        (s) =>
                                          s.studentId === student.studentId,
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-[120px]">
                                      <SelectValue placeholder="Chọn lớp" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {classes
                                        .filter(
                                          (c) =>
                                            c.status === "Hoạt động" &&
                                            c.className[0] == grade &&
                                            c.className !== className,
                                        )
                                        .map((c) => (
                                          <SelectItem
                                            key={c.classId}
                                            value={c.classId}
                                          >
                                            {c.className}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}

      {/* Bảng danh sách các lớp */}

      {/* Chuyển cả lớp */}
      <Dialog open={confirmChangeGrade} onOpenChange={setConfirmChangeGrade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-4 text-2xl">
              Xác nhận đổi khối
            </DialogTitle>
          </DialogHeader>
          <div>
            {mode === "class"
              ? "Bạn đang có lớp được chọn để chuyển dữ liệu."
              : "Bạn đang có học sinh được chọn để chuyển dữ liệu."}
            <br />
            Nếu đổi khối, danh sách {mode === "class" ? "lớp" : "học sinh"} đã
            chọn sẽ bị xóa.
            <br />
            Bạn có chắc chắn muốn đổi khối không?
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmChangeGrade(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                setGrade(pendingGrade);
                setClassName("");
                setSelectedClasses([]);
                setSelectedStudents([]);
                setSelectedRepeatStudents([]);
                setSelectedAdjustStudents([]);
                setConfirmChangeGrade(false);
              }}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmChangeClass} onOpenChange={setConfirmChangeClass}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-4 text-2xl">
              Xác nhận đổi lớp
            </DialogTitle>
          </DialogHeader>
          <div>
            Bạn đang có học sinh được chọn để chuyển dữ liệu.
            <br />
            Nếu đổi lớp, danh sách học sinh đã chọn sẽ bị xóa.
            <br />
            Bạn có chắc chắn muốn đổi lớp không?
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmChangeClass(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                setClassName(pendingClassName);
                setSelectedStudents([]);
                setSelectedRepeatStudents([]);
                setSelectedAdjustStudents([]);
                setConfirmChangeClass(false);
              }}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
