import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
// ... existing code ...
import { Label } from "@/components/ui/label";
import { useSubjects } from "@/services/common/queries";
import { useTeacherSubject } from "@/services/principal/queries";
import { useTeacher } from "@/services/teacher/queries";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useUpdateTeacherSubject } from "@/services/principal/mutation";
import { Button } from "@/components/ui/button";
export default function UpdateTeacherSubjectModal({
  open,
  onClose,
  teacherId,
}) {
  const teacherQuery = useTeacher(teacherId);
  const teacher = teacherQuery.data || {};
  const teacherSubjectQuery = useTeacherSubject(teacherId);
  const teacherSubjects = teacherSubjectQuery.data || [];

  const subjectQuery = useSubjects();
  const subjects = subjectQuery.data || [];

  const updateTeacherSubjectMutation = useUpdateTeacherSubject();

  // State for selected subjects and main subject
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [mainSubjectId, setMainSubjectId] = useState(null);

  useEffect(() => {
    // Initialize state from teacherSubjects when modal opens
    if (open) {
      setSelectedSubjects(teacherSubjects?.map((s) => s.subjectId));
      const main = teacherSubjects.find((s) => s.isMainSubject);
      setMainSubjectId(main ? main.subjectId : null);
    }
  }, [open, teacherSubjects]);

  const handleCheckboxChange = (subjectID) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectID)
        ? prev.filter((id) => id !== subjectID)
        : [...prev, subjectID],
    );
    // If unchecking the main subject, also unset mainSubjectId
    if (mainSubjectId === subjectID && selectedSubjects.includes(subjectID)) {
      setMainSubjectId(null);
    }
  };

  const handleSave = () => {
    const data = {
      teacherId,
      subjects: selectedSubjects.map((subjectId) => ({
        subjectId,
        isMainSubject: subjectId === mainSubjectId,
      })),
    };
    console.log(data); // You can replace this with your API call
    updateTeacherSubjectMutation.mutate(
      { teacherId, data },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) handleClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa môn học cho giáo viên</DialogTitle>
        </DialogHeader>
        {teacher && (
          <>
            <div className="mt-4 mb-2">
              <Label htmlFor="teacher-fullname" className="font-medium">
                Tên giáo viên:
              </Label>
              <Input
                id="teacher-fullname"
                value={teacher.fullName || ""}
                readOnly
                className="mt-2"
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="main-subject-select" className="font-medium">
                Chọn môn học chính:
              </Label>
              <Select
                value={mainSubjectId ? String(mainSubjectId) : ""}
                onValueChange={(val) => setMainSubjectId(Number(val))}
                disabled={selectedSubjects.length === 0}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue
                    placeholder={
                      selectedSubjects.length === 0
                        ? "Vui lòng chọn ít nhất một môn"
                        : "Chọn môn học chính"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {subjects
                    .filter((subject) =>
                      selectedSubjects.includes(subject.subjectID),
                    )
                    .map((subject) => (
                      <SelectItem
                        key={subject.subjectID}
                        value={String(subject.subjectID)}
                      >
                        {subject.subjectName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <span className="font-medium">Chọn môn dạy:</span>
              <form className="mt-2 grid grid-cols-3 gap-3">
                {subjects.map((subject) => (
                  <div
                    key={subject.subjectID}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      id={`subject-${subject.subjectID}`}
                      checked={selectedSubjects.includes(subject.subjectID)}
                      onCheckedChange={() =>
                        handleCheckboxChange(subject.subjectID)
                      }
                      className="accent-blue-600"
                    />
                    <Label
                      htmlFor={`subject-${subject.subjectID}`}
                      className="flex-1 cursor-pointer"
                    >
                      {subject.subjectName}
                    </Label>
                  </div>
                ))}
              </form>
            </div>
            <div className="flex justify-end gap-2">
              <Button className="px-4 py-2" onClick={handleClose} type="button">
                Đóng
              </Button>
              <Button
                className="bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                onClick={handleSave}
                type="button"
              >
                Lưu
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
