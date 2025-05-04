import { useEffect, useState } from "react";
import DatePicker from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { formatDate } from "@/helpers/formatDate";
import { useCreateAcademicYear } from "@/services/principal/mutation";
import {
  useAcademicYear,
  useSemestersByAcademicYear,
} from "@/services/common/queries";
import { useUpdateAcademicYear } from "@/services/principal/mutation";

const UpdateAcedemicYearModal = ({ open, onCancel, academicYearId }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [startSemester1, setStartSemester1] = useState(null);
  const [endSemester1, setEndSemester1] = useState(null);
  const [startSemester2, setStartSemester2] = useState(null);
  const [endSemester2, setEndSemester2] = useState(null);

  const semesterQuery = useSemestersByAcademicYear(academicYearId);
  const academicYearQuery = useAcademicYear(academicYearId);
  const semester1 = (semesterQuery?.data || []).find(
    (s) => s.semesterName === "Học kỳ 1",
  );
  const semester2 = (semesterQuery?.data || []).find(
    (s) => s.semesterName === "Học kỳ 2",
  );
  const academicYear = academicYearQuery?.data;
  const updateAcademicYearMutation = useUpdateAcademicYear(); // Assuming you have a mutation for updating academic year

  // Validation logic
  const isEndSemester1Valid =
    endSemester1 && startSemester1 && endSemester1 > startSemester1;
  const isStartSemester2Valid =
    startSemester2 && endSemester1 && startSemester2 > endSemester1;

  const isStartSemester1Valid =
    startSemester1 && startSemester1.getFullYear() >= year;
  const isEndSemester2Valid =
    endSemester2 &&
    startSemester2 &&
    endSemester1 &&
    endSemester2 > endSemester1 &&
    endSemester2 > startSemester2 &&
    endSemester2.getFullYear() <= year + 1;

  const isFormValid =
    year &&
    startSemester1 &&
    endSemester1 &&
    startSemester2 &&
    endSemester2 &&
    isEndSemester1Valid &&
    isStartSemester2Valid &&
    isEndSemester2Valid &&
    isStartSemester1Valid;
  const handleSave = () => {
    if (isFormValid) {
      const data = {
        academicYearId,
        yearName: `${year}-${year + 1}`,
        startDate: formatDate(startSemester1),
        endDate: formatDate(endSemester2),
        semester1StartDate: formatDate(startSemester1),
        semester1EndDate: formatDate(endSemester1),
        semester2StartDate: formatDate(startSemester2),
        semester2EndDate: formatDate(endSemester2),
      };
      updateAcademicYearMutation.mutate({ academicYearId, data });
      onCancel();
    }
  };

  useEffect(() => {
    if (academicYear && semester1 && semester2) {
      setYear(+academicYear.yearName.split("-")[0]);
      setStartSemester1(new Date(semester1.startDate));
      setEndSemester1(new Date(semester1.endDate));
      setStartSemester2(new Date(semester2.startDate));
      setEndSemester2(new Date(semester2.endDate));
    }
  }, [
    academicYearQuery.data,
    semesterQuery.data,
    academicYear,
    semester1,
    semester2,
  ]);

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Cập nhật học mới
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 mb-4">
          <label className="mb-1 block font-medium">
            Năm học <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-24 rounded border px-2 py-1"
            />
            <span className="self-center">-</span>
            <input
              type="number"
              min="2000"
              max="2100"
              value={year + 1}
              disabled
              className="w-24 rounded border bg-gray-100 px-2 py-1"
            />
          </div>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-medium">
              Ngày bắt đầu học kỳ 1 <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={startSemester1}
              onSelect={(date) => {
                if (date && date.getFullYear() < year) {
                  toast.error(
                    "Ngày bắt đầu học kỳ 1 không được nhỏ hơn năm học hiện tại",
                  );
                  return;
                }
                if (endSemester1 && date && endSemester1 <= date) {
                  toast.error(
                    "Ngày bắt đầu học kỳ 1 phải nhỏ hơn ngày kết thúc học kỳ 1",
                  );
                  return;
                }
                setStartSemester1(date);
              }}
              disabled={false}
            />
          </div>
          <div>
            <label className="mb-1 block font-medium">
              Ngày kết thúc học kỳ 1 <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={endSemester1}
              onSelect={(date) => {
                if (startSemester1 && date && date <= startSemester1) {
                  toast.error(
                    "Ngày kết thúc học kỳ 1 phải lớn hơn ngày bắt đầu học kỳ 1",
                  );
                  return;
                }
                setEndSemester1(date);
              }}
              disabled={false}
            />
            {!isEndSemester1Valid && endSemester1 && startSemester1 && (
              <div className="mt-1 text-xs text-red-500">
                Ngày kết thúc học kỳ 1 phải lớn hơn ngày bắt đầu học kỳ 1
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block font-medium">
              Ngày bắt đầu học kỳ 2 <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={startSemester2}
              onSelect={(date) => {
                if (endSemester1 && date && date <= endSemester1) {
                  toast.error(
                    "Ngày bắt đầu học kỳ 2 phải lớn hơn ngày kết thúc học kỳ 1",
                  );
                  return;
                }
                setStartSemester2(date);
              }}
              disabled={false}
            />
            {!isStartSemester2Valid && startSemester2 && endSemester1 && (
              <div className="mt-1 text-xs text-red-500">
                Ngày bắt đầu học kỳ 2 phải lớn hơn ngày kết thúc học kỳ 1
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block font-medium">
              Ngày kết thúc học kỳ 2 <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={endSemester2}
              onSelect={(date) => {
                if (date && date.getFullYear() > year + 1) {
                  toast.error(
                    "Ngày kết thúc học kỳ 2 không được vượt quá năm học tiếp theo",
                  );
                  return;
                }
                if (
                  (startSemester2 && date && date <= startSemester2) ||
                  (endSemester1 && date && date <= endSemester1)
                ) {
                  toast.error(
                    "Ngày kết thúc học kỳ 2 phải lớn hơn ngày bắt đầu học kỳ 2",
                  );
                  return;
                }
                setEndSemester2(date);
              }}
              disabled={false}
            />
            {!isEndSemester2Valid && endSemester2 && (
              <div className="mt-1 text-xs text-red-500">
                Ngày kết thúc học kỳ 2 phải lớn hơn ngày bắt đầu học kỳ 2 và
                ngày kết thúc học kỳ 1
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={!isFormValid}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateAcedemicYearModal;
