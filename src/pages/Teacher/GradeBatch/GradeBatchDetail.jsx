import { useEffect, useState } from "react";
import { useSemestersByAcademicYear } from "@/services/common/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import DatePicker from "@/components/DatePicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUpdateGradeBatch } from "@/services/principal/mutation";
import { formatDate, formatDateString } from "@/helpers/formatDate";
import toast from "react-hot-toast";
import { cleanString } from "@/helpers/removeWhiteSpace";
import { useGradeBatch } from "@/services/principal/queries";

export default function GradeBatchDetail({
  isModalOpen,
  setIsModalOpen,
  gradeBatchId,
  semester,
}) {
  const toStartOfDay = (date) => {
    if (!date) return null;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const currentSemester = semester;
  const semesterStartDate = currentSemester
    ? toStartOfDay(currentSemester.startDate)
    : null;
  const semesterEndDate = currentSemester
    ? toStartOfDay(currentSemester.endDate)
    : null;

  const gradeBatchQuery = useGradeBatch(gradeBatchId);
  const gradeBatch = gradeBatchQuery.data || {};
  const gradeBatchUpdateMutation = useUpdateGradeBatch();

  const [formData, setFormData] = useState({
    name: "",
    startDate: null,
    endDate: null,
    isLocked: false,
  });

  const validateName = (name) => {
    const cleanedName = cleanString(name.trim());
    if (cleanedName.length > 50) {
      return "Tên đợt không được vượt quá 30 ký tự";
    }
    if (!/^[\p{L}\p{N} ]*$/u.test(cleanedName)) {
      return "Tên đợt không được chứa ký tự đặc biệt";
    }
    if (!/[\p{L}]/u.test(cleanedName)) {
      return "Tên đợt phải chứa ít nhất 1 chữ cái";
    }
    return "";
  };

  const validateStartDate = (startDate, endDate) => {
    if (!semesterStartDate || !semesterEndDate) return "";
    if (!startDate) return "";
    if (startDate < semesterStartDate) {
      return `Ngày bắt đầu phải từ ngày ${formatDateString(semester?.startDate)} trờ đi`;
    }
    if (startDate >= semesterEndDate) {
      return `Ngày bắt đầu phải nhỏ hơn ngày ${formatDateString(semester?.endDate)}`;
    }
    if (endDate && startDate >= endDate)
      return `Ngày bắt đầu phải nhỏ hơn ${formatDateString(formatDate(endDate))}`;
    return "";
  };

  const validateEndDate = (endDate, startDate) => {
    if (!semesterStartDate || !semesterEndDate) return "";
    if (!endDate) return "";
    if (endDate <= semesterStartDate)
      return `Ngày kết thúc phải lớn hơn ngày ${formatDateString(semester?.startDate)}`;
    if (startDate && endDate <= startDate)
      return `Ngày kết thúc phải lớn hơn ngày ${formatDateString(formatDate(startDate))}`;
    if (endDate >= semesterEndDate)
      return `Ngày kết thúc phải nhỏ hơn ngày  ${formatDateString(semester?.endDate)}`;
    return "";
  };
  const isFormValid = formData.name && formData.startDate && formData.endDate;

  const handleSubmit = () => {
    const nameError = validateName(formData.name);
    if (nameError) {
      toast.error(nameError);
      return;
    }

    const payload = {
      batchName: cleanString(formData.name.trim()),
      semesterId: semester.semesterID,
      academicYearId: semester.academicYearID,
      startDate: formatDate(formData.startDate),
      endDate: formatDate(formData.endDate),
      status: formData.isLocked ? "Không hoạt động" : "Hoạt động",
    };

    console.log("Form data submitted:", payload);

    gradeBatchUpdateMutation.mutate(
      { gradeBatchId, payload },
      {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      },
    );

    // setIsModalOpen(false);
  };

  useEffect(() => {
    if (gradeBatchId) {
      setFormData({
        name: gradeBatch.batchName,
        startDate: toStartOfDay(gradeBatch.startDate),
        endDate: toStartOfDay(gradeBatch.endDate),
        isLocked: gradeBatch.status === "Không hoạt động",
      });
    }
  }, [gradeBatch]);

  return (
    <div className="">
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-lg border-0 shadow-lg sm:max-w-[600px]">
          <DialogHeader className="">
            <DialogTitle className="text-xl font-bold">
              Cập nhật đợt nhập điểm
            </DialogTitle>
            <Button
              variant="ghost"
              className="ring-offset-background absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
              onClick={() => setIsModalOpen(false)}
            ></Button>
          </DialogHeader>

          <div className="grid gap-5 px-4 py-6">
            {/* Tên đợt */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="font-medium text-gray-700">
                Tên đợt
              </label>
              <div className="col-span-3">
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className={`focus:ring-opacity-50 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200`}
                  placeholder="Nhập tên đợt nhập điểm"
                />
              </div>
            </div>

            {/* Thời gian */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="font-medium text-gray-700">Từ ngày</label>
              <div className="col-span-3">
                <DatePicker
                  value={formData.startDate}
                  onSelect={(date) => {
                    const startDateError = validateStartDate(
                      date,
                      formData.endDate,
                    );
                    if (startDateError) {
                      toast.error(startDateError);
                      return;
                    }
                    return setFormData((prev) => ({
                      ...prev,
                      startDate: date,
                    }));
                  }}
                  disabled={false}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="font-medium text-gray-700">Đến ngày</label>
              <div className="col-span-3">
                <DatePicker
                  value={formData.endDate}
                  onSelect={(date) => {
                    const endDateError = validateEndDate(
                      date,
                      formData.startDate,
                    );
                    if (endDateError) {
                      toast.error(endDateError);
                      return;
                    }
                    return setFormData((prev) => ({
                      ...prev,
                      endDate: date,
                    }));
                  }}
                  disabled={false}
                  className="w-full"
                />
              </div>
            </div>

            {/* Khóa đợt */}
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4">
                <div className="flex items-center space-x-2 rounded-md bg-gray-50">
                  <Checkbox
                    id="isLocked"
                    checked={formData.isLocked}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isLocked: checked }))
                    }
                    className="h-5 w-5 text-blue-600"
                  />
                  <label
                    htmlFor="isLocked"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Khóa đợt
                  </label>
                </div>
              </div>
            </div>

            {/* Các cột điểm */}
          </div>

          <DialogFooter className="flex justify-end gap-2 rounded-b-lg bg-gray-50">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={!isFormValid}
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
