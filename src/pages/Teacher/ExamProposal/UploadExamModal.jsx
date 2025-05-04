// ... existing code ...
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cleanString } from "@/helpers/removeWhiteSpace";
import { useGradeLevels, useSubjects } from "@/services/common/queries";
import { useUploadExam } from "@/services/teacher/mutation";
import { jwtDecode } from "jwt-decode";
import { Upload, XCircle, FileText, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
// ... existing code ...

function UploadExamModal({ semester, open, setOpen }) {
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  const gradeLevelQuery = useGradeLevels();
  const gradeLevels = gradeLevelQuery.data || [];
  const subjectQuery = useSubjects();
  const subjects = subjectQuery.data || [];
  const uploadExamMutation = useUploadExam();
  const token = JSON.parse(localStorage.getItem("token"));
  const user = jwtDecode(token);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Vui lòng chọn file đề thi!");
      return;
    }
    const formData = new FormData();
    formData.append("TeacherId", user.teacherId);
    formData.append("file", file);
    formData.append("Grade", grade);
    formData.append("SubjectId", subject);
    formData.append("Title", cleanString(title.trim()));
    formData.append("SemesterId", semester.semesterID);
    uploadExamMutation.mutate(formData, {
      onSuccess: () => {
        setGrade("");
        setSubject("");
        setTitle("");
        setFile(null);
      },
    });
  };
  useEffect(() => {
    if (!open) {
      setGrade("");
      setSubject("");
      setTitle("");
      setFile(null);
      setDragging(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogTitle className="mb-4 text-center">Tải lên đề thi</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="grade" className="mb-1 block">
              Khối lớp
            </Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger id="grade">
                <SelectValue placeholder="Chọn khối lớp" />
              </SelectTrigger>
              <SelectContent>
                {gradeLevels.map((gradeLevel) => (
                  <SelectItem
                    value={gradeLevel.gradeLevelId + ""}
                    key={gradeLevel.gradeLevelId}
                  >
                    {gradeLevel.gradeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subject" className="mb-1 block">
              Môn học
            </Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Chọn môn học" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem
                    value={subject.subjectID + ""}
                    key={subject.subjectID}
                  >
                    {subject.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="title" className="mb-1 block">
              Tiêu đề
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề đề thi"
              required
            />
          </div>
          {/* Giao diện upload file giống ExcelImportModal */}
          {file ? (
            <div className="flex items-center justify-between rounded-md border border-gray-300 p-3 text-gray-700">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              {!uploadExamMutation.isPending && (
                <XCircle
                  className="h-5 w-5 cursor-pointer text-red-500"
                  onClick={() => setFile(null)}
                />
              )}
            </div>
          ) : (
            <div
              className={`flex flex-col items-center gap-2 rounded-md border-2 border-dashed p-6 text-gray-600 transition ${
                dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-10 w-10" />
              <Label
                htmlFor="file-upload"
                className="cursor-pointer font-medium"
              >
                Thêm File
              </Label>
              <span className="mt-2 text-sm">hoặc kéo và thả</span>
              <input
                id="file-upload"
                type="file"
                accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
            disabled={uploadExamMutation.isPending}
          >
            {uploadExamMutation.isPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Đang tải lên...
              </>
            ) : (
              "Tải lên"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
// ... existing code ...

export default UploadExamModal;
