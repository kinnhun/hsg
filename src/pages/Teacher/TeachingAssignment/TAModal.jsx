import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Dialog as ConfirmDialog,
  DialogTitle as ConfirmDialogTitle,
  DialogHeader as ConfirmDialogHeader,
  DialogContent as ConfirmDialogContent,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useSubjectConfigue,
  useTeacherSubjects,
} from "@/services/principal/queries";
import toast from "react-hot-toast";
import { useClasses } from "@/services/common/queries";
import { useAssginTeaching } from "@/services/principal/mutation";

export default function TAModal({ open, onOpenChange, semester }) {
  //get teacher + subject
  const teacherQuery = useTeacherSubjects();
  const subjects = teacherQuery.data?.subjects || [];
  const teachers = teacherQuery.data?.teachers || [];

  //get classes
  const classQuery = useClasses();
  const classes = classQuery.data || [];

  //get subject configue
  const subjectConfigQuery = useSubjectConfigue();
  const subjectConfigs = subjectConfigQuery.data || [];

  //assign teaching
  const assignTeachingMutation = useAssginTeaching();

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectAssignments, setSubjectAssignments] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTeacher, setPendingTeacher] = useState("");

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
  };

  const handleClassToggle = (className) => {
    setSubjectAssignments((prev) => ({
      ...prev,
      [selectedSubject]: prev[selectedSubject]?.includes(className)
        ? prev[selectedSubject].filter((c) => c !== className)
        : [...(prev[selectedSubject] || []), className],
    }));
  };
  const getAssignmentString = () => {
    const assignments = [];
    subjects.forEach((subject) => {
      const assignedClassIds = subjectAssignments?.[subject.subjectID] || [];
      if (assignedClassIds.length > 0) {
        // Map classIds to classNames for display
        const classNames = assignedClassIds
          .map((id) => {
            const found = classes.find((cls) => cls.classId === id);
            return found ? found.className : id;
          })
          .sort((a, b) => a.localeCompare(b));
        assignments.push(`${subject.subjectName}(${classNames.join(", ")})`);
      }
    });
    return assignments.join(" - ");
  };

  const handleSave = () => {
    if (!selectedTeacher) {
      toast.error("Vui lòng chọn giáo viên");
      return;
    }

    if (!selectedSubject) {
      toast.error("Vui lòng chọn môn học");
      return;
    }

    if (
      !subjectAssignments[selectedSubject] ||
      subjectAssignments[selectedSubject].length === 0
    ) {
      toast.error("Vui lòng chọn ít nhất một lớp cho môn học này");
      return;
    }

    const assignments = [];
    subjects.forEach((subject) => {
      const assignedClassIds = subjectAssignments?.[subject.subjectID] || [];
      if (assignedClassIds.length > 0) {
        const data = {
          teacherId: selectedTeacher,
          subjectId: subject.subjectID,
          classAssignments: assignedClassIds.map((classId) => ({
            classId,
          })),
          semesterId: semester.semesterID,
        };
        assignments.push(data);
      }
    });
    console.log("Saving data:", assignments);
    assignTeachingMutation.mutate(assignments);
    // Add your API call here
    onOpenChange(false);
  };
  const handleClose = () => {
    onOpenChange(false);
  };

  const calculateTotalPeriods = () => {
    let totalHK1 = 0;
    let totalHK2 = 0;
    if (subjectAssignments) {
      Object.entries(subjectAssignments).forEach(
        ([subjectId, assignedClassIds]) => {
          assignedClassIds.forEach((classId) => {
            const cls = classes.find((c) => c.classId === classId);
            if (cls) {
              const config = subjectConfigs.find(
                (cfg) =>
                  cfg.subjectId === Number(subjectId) &&
                  cfg.gradeLevelId === cls.gradeLevelId,
              );
              if (config) {
                totalHK1 += Number(config.periodsPerWeekHKI) || 0;
                totalHK2 += Number(config.periodsPerWeekHKII) || 0;
              }
            }
          });
        },
      );
    }
    if (semester?.semesterName === "Học kỳ 1") {
      return `${totalHK1}`;
    }
    if (semester?.semesterName === "Học kỳ 2") {
      return `${totalHK2}`;
    }
    return `Học kỳ 1: ${totalHK1} - Học kỳ 2: ${totalHK2}`;
  };

  const hasAssignments = () => {
    return Object.values(subjectAssignments).some(
      (arr) => arr && arr.length > 0,
    );
  };

  const resetTeacherAndAssignments = (newTeacher = "") => {
    setSelectedTeacher(newTeacher);
    setSelectedSubject("");
    const initialAssignments = {};
    subjects.forEach((s) => {
      initialAssignments[s.subjectID] = [];
    });
    setSubjectAssignments(initialAssignments);
  };

  useEffect(() => {
    if (open && subjects.length > 0) {
      setSelectedTeacher("");
      setSelectedSubject("");
      // Initialize assignments for all subjects
      const initialAssignments = {};
      subjects.forEach((s) => {
        initialAssignments[s.subjectID] = [];
      });
      setSubjectAssignments(initialAssignments);
    }
    if (!open) {
      setSelectedTeacher("");
      setSelectedSubject("");
      setSubjectAssignments({});
    }
  }, [open, subjects]);

  useEffect(() => {
    // Reset subject and assignments when teacher changes
    if (selectedTeacher !== "") {
      setSelectedSubject("");
      const initialAssignments = {};
      subjects.forEach((s) => {
        initialAssignments[s.subjectID] = [];
      });
      setSubjectAssignments(initialAssignments);
    }
  }, [selectedTeacher, subjects]);

  const handleTeacherChange = (value) => {
    if (hasAssignments() && selectedTeacher) {
      setPendingTeacher(value);
      setShowConfirmModal(true);
    } else {
      resetTeacherAndAssignments(value);
    }
  };

  const handleConfirmChangeTeacher = () => {
    resetTeacherAndAssignments(pendingTeacher);
    setShowConfirmModal(false);
    setPendingTeacher("");
  };

  const handleCancelChangeTeacher = () => {
    setShowConfirmModal(false);
    setPendingTeacher("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!max-w-4xl">
          <DialogHeader>
            <DialogTitle>Phân công giáo viên</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Giáo viên</label>
                <Select
                  value={selectedTeacher}
                  onValueChange={handleTeacherChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giáo viên" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem
                        key={teacher.teacherId}
                        value={teacher.teacherId}
                      >
                        {teacher.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Môn học</label>
                <Select
                  value={selectedSubject}
                  onValueChange={handleSubjectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      let teacherSubjectIds = [];
                      let teacherMainSubjectMap = {};
                      if (selectedTeacher) {
                        const teacher = teachers.find(
                          (t) => t.teacherId === selectedTeacher,
                        );
                        if (teacher?.subjects) {
                          teacherSubjectIds = teacher.subjects.map((s) =>
                            typeof s === "object" ? s.subjectId : s,
                          );
                          // Build a map: subjectId -> isMainSubject
                          teacher.subjects.forEach((s) => {
                            const subjectId =
                              typeof s === "object" ? s.subjectId : s;
                            const isMain =
                              typeof s === "object" ? s.isMainSubject : false;
                            teacherMainSubjectMap[subjectId] = isMain;
                          });
                        }
                      }
                      // Sort: teachable subjects first
                      const sortedSubjects = [...subjects].sort((a, b) => {
                        const aCanTeach = teacherSubjectIds.includes(
                          a.subjectID,
                        );
                        const bCanTeach = teacherSubjectIds.includes(
                          b.subjectID,
                        );
                        if (aCanTeach === bCanTeach) return 0;
                        return aCanTeach ? -1 : 1;
                      });
                      return sortedSubjects.map((subject) => {
                        let canTeach = true;
                        if (selectedTeacher) {
                          canTeach = teacherSubjectIds.includes(
                            subject.subjectID,
                          );
                        }
                        // Append * if isMainSubject = true for this teacher
                        const isMain = teacherMainSubjectMap[subject.subjectID];
                        return (
                          <SelectItem
                            key={subject.subjectID}
                            value={subject.subjectID}
                            disabled={!canTeach}
                          >
                            {subject.subjectName}
                            {isMain ? (
                              <span className="text-red-600">*</span>
                            ) : (
                              ""
                            )}
                          </SelectItem>
                        );
                      });
                    })()}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Tổng số tiết/tuần {semester?.semesterName?.toLowerCase()}
                </label>

                <div>
                  <Input
                    value={calculateTotalPeriods()}
                    disabled
                    className="w-64 disabled:opacity-100"
                  />
                </div>
              </div>
            </div>

            <div>
              <div>
                <label className="text-sm font-medium">
                  Danh sách phân công
                </label>
                <div className="flex gap-2">
                  <Input
                    value={getAssignmentString()}
                    disabled
                    className="mt-1 disabled:opacity-100"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="w-16 p-2"></th>
                    <th className="p-2 text-left">Tên lớp</th>
                    <th className="p-2 text-center">Số tiết/tuần HK1</th>
                    <th className="p-2 text-center">Số tiết/tuần HK2</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => {
                    // Find subject config for this subject and class's grade level
                    const config = subjectConfigs.find(
                      (cfg) =>
                        cfg.subjectId === Number(selectedSubject) &&
                        cfg.gradeLevelId === cls.gradeLevelId,
                    );
                    const isDisabled = !config;
                    return (
                      <tr
                        key={cls.classId}
                        className={`cursor-pointer border-t hover:bg-slate-50 ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                        onClick={() => {
                          if (!isDisabled) handleClassToggle(cls.classId);
                        }}
                      >
                        <td className="p-2 text-center">
                          <Checkbox
                            checked={(
                              subjectAssignments?.[selectedSubject] || []
                            ).includes(cls.classId)}
                            className="cursor-pointer"
                            disabled={isDisabled}
                          />
                        </td>
                        <td className="p-2">{cls.className}</td>
                        <td className="p-2 text-center">
                          {config ? config.periodsPerWeekHKI : "-"}
                        </td>
                        <td className="p-2 text-center">
                          {config ? config.periodsPerWeekHKII : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Đóng
            </Button>
            <Button onClick={handleSave}>Lưu</Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <ConfirmDialogContent className="max-w-md">
          <ConfirmDialogHeader>
            <ConfirmDialogTitle>Xác nhận chuyển giáo viên</ConfirmDialogTitle>
          </ConfirmDialogHeader>

          <div className="mb-4 text-base font-medium">
            Đang có giáo viên đang được phân công.
            <br />
            Bạn có chắc chắn muốn đổi giáo viên không?
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelChangeTeacher}>
              Hủy
            </Button>
            <Button onClick={handleConfirmChangeTeacher}>Xác nhận</Button>
          </div>
        </ConfirmDialogContent>
      </ConfirmDialog>
    </>
  );
}
