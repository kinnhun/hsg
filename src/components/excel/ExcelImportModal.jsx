import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Upload, XCircle, FileText, Download, Loader } from "lucide-react";
import { axiosInstance } from "@/services/axios";
import toast from "react-hot-toast";

export default function ExcelImportModal({ type }) {
  const [file, setFile] = useState(null);
  const [importType, setImportType] = useState("update");
  const [dragging, setDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Quản lý trạng thái modal
  const queryClient = useQueryClient();

  // Mutation xử lý import file
  const importMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axiosInstance.post(`/${type}/import`, formData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Import dữ liệu thành công!");
      queryClient.invalidateQueries(["teachers"]); // Làm mới danh sách giáo viên
      queryClient.invalidateQueries(["students"]); // Làm mới danh sách giáo viên
      setIsOpen(false); // Đóng modal
    },
    // onError: () => {
    //   toast.error("Có lỗi xảy ra khi import dữ liệu!");
    // },

    onSettled: (data, error) => {
      if (error) {
        console.log(error);
        toast.error(error?.response?.data);
      } else {
        console.log(data);
      }
    },
  });

  const sampleFiles = {
    teachers:
      "https://docs.google.com/spreadsheets/d/1HxEDkY54T_NZFDGD_nqIAAt5rxEneW9l/export?format=xlsx",
    student:
      "https://docs.google.com/spreadsheets/d/1Wb9Nra31iOYD3i1R2mlEfgwv8aPnkBLa/export?format=xlsx",
  };

  // console.log(type);
  const sampleFileUrl = sampleFiles[type] || "#";

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

  const handleUpload = () => {
    if (file) {
      importMutation.mutate(file);
    } else {
      toast.error("Vui lòng chọn file Excel!");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!importMutation.isPending) {
          setIsOpen(open);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Nhập dữ liệu từ Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nhập thông tin từ Excel</DialogTitle>
        </DialogHeader>

        {/* Tải file mẫu */}
        <div className="mt-2 flex items-center justify-between border-b pb-2">
          <a
            href={sampleFileUrl}
            download
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            <Download className="h-5 w-5" />
            <span>Tải file excel mẫu</span>
          </a>
        </div>

        {file ? (
          <div className="flex items-center justify-between rounded-md border border-gray-300 p-3 text-gray-700">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">{file.name}</span>
            </div>
            {!importMutation.isPending && (
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
            <Label htmlFor="file-upload" className="cursor-pointer font-medium">
              Thêm File
            </Label>
            <span className="mt-2 text-sm">hoặc kéo và thả</span>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Chọn loại import */}
        <RadioGroup
          value={importType}
          onValueChange={setImportType}
          className="space-y-2"
        ></RadioGroup>

        {/* Nút hành động */}
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={importMutation.isPending}
          >
            Đóng
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || importMutation.isPending}
          >
            {importMutation.isPending ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Đang tải...
              </>
            ) : (
              "Tải lên"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
