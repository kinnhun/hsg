import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { PlusCircle } from "lucide-react";
import { useCreateSubject } from "@/services/principal/mutation";
import { useGradeLevels } from "@/services/common/queries";
import { cleanString } from "@/helpers/removeWhiteSpace";

// Add schema definition
const subjectSchema = z.object({
  subjectName: z.string().min(1, "Tên môn học không được để trống"),
  subjectCategory: z.string().min(1, "Vui lòng chọn tổ bộ môn"),
  typeOfGrade: z.string().min(1, "Vui lòng chọn hình thức tính điểm"),
  gradesData: z.array(
    z.object({
      gradeLevelId: z.number(),
      gradeName: z.string().optional(),
      periodsPerWeekHKI: z.number().nullable(),
      periodsPerWeekHKII: z.number().nullable(),
      continuousAssessmentsHKI: z.number().nullable(),
      continuousAssessmentsHKII: z.number().nullable(),
      midtermAssessments: z.number().nullable(),
      finalAssessments: z.number().nullable(),
    }),
  ),
});

export const CreateSubjectModal = ({ open, setOpen }) => {
  const gradeLevelsQuery = useGradeLevels();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues: {},
  });

  const createSubjectMutation = useCreateSubject();

  const gradesData = watch("gradesData");

  const [enabledGrades, setEnabledGrades] = useState(
    gradeLevelsQuery?.data?.reduce(
      (acc, gradeLevel) => ({
        ...acc,
        [gradeLevel.gradeLevelId]: true,
      }),
      {},
    ) || {},
  );

  useEffect(() => {
    if (gradeLevelsQuery.data) {
      reset({
        subjectName: "",
        subjectCategory: "",
        typeOfGrade: "",
        gradesData: gradeLevelsQuery.data.map((gradeLevel) => ({
          gradeLevelId: gradeLevel.gradeLevelId,
          gradeName: gradeLevel.gradeName,
          periodsPerWeekHKI: 4,
          periodsPerWeekHKII: 4,
          continuousAssessmentsHKI: 4,
          continuousAssessmentsHKII: 4,
          midtermAssessments: 1,
          finalAssessments: 1,
        })),
      });
    }
  }, [gradeLevelsQuery.data]);

  const handleGradeToggle = (gradeLevelId) => {
    setEnabledGrades((prev) => ({
      ...prev,
      [gradeLevelId]: !prev[gradeLevelId],
    }));
    trigger("gradesData");
  };

  const handleNumericInput = (e, index, field) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const numericValue = value === "" ? null : parseInt(value);

    // Update the specific field in gradesData
    const updatedGradesData = [...gradesData];
    updatedGradesData[index] = {
      ...updatedGradesData[index],
      [field]: numericValue,
    };

    setValue("gradesData", updatedGradesData);
    trigger("gradesData");
  };
  // Modify onSubmit to include validation
  const onSubmit = (data) => {
    const hasNullInEnabledGrades = data.gradesData.some((grade, index) => {
      if (!enabledGrades[grade.gradeLevelId]) return false;
      return Object.entries(grade).some(([key, value]) => {
        return key !== "gradeLevelId" && value === null;
      });
    });

    if (hasNullInEnabledGrades) {
      toast.error("Vui lòng điền đầy đủ thông tin cho các khối được chọn");
      return;
    }

    const cleanedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, cleanString(value)]),
    );

    const filteredData = {
      ...cleanedData,
      gradesData: data.gradesData.filter(
        (grade) => enabledGrades[grade.gradeLevelId],
      ),
    };

    console.log(filteredData);
    createSubjectMutation.mutate(filteredData, {
      onSuccess: () => {
        reset({
          subjectName: "",
          subjectCategory: "",
          typeOfGrade: "",
          gradesData: [],
        });
        setEnabledGrades({});
        setOpen(false);
      },
    });
  };

  console.log(gradesData);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Tạo môn học mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject-name">Tên môn học</Label>
            <Input
              id="subject-name"
              className="h-10 w-full px-3 py-2 text-sm"
              {...register("subjectName", {
                required: "Tên môn học không được để trống",
              })}
            />
            {errors.subjectName && (
              <p className="text-sm text-red-500">
                {errors.subjectName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-department">Tổ bộ môn</Label>
            <Select
              onValueChange={(value) => setValue("subjectCategory", value)}
              defaultValue={watch("subjectCategory")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn tổ bộ môn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Khoa học tự nhiên">
                  Khoa học tự nhiên
                </SelectItem>
                <SelectItem value="Khoa học xã hội">Khoa học xã hội</SelectItem>
              </SelectContent>
            </Select>
            {errors.subjectCategory && (
              <p className="text-sm text-red-500">
                {errors.subjectCategory.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="type-of-grade">Hình thức tính điểm</Label>
            <Select
              onValueChange={(value) => setValue("typeOfGrade", value)}
              defaultValue={watch("typeOfGrade")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn hình thức tính điểm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tính điểm">Tính điểm</SelectItem>
                <SelectItem value="Nhận xét">Nhận xét</SelectItem>
              </SelectContent>
            </Select>
            {errors.typeOfGrade && (
              <p className="text-sm text-red-500">
                {errors.typeOfGrade.message}
              </p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="border-b">
                  <th className="border-r p-2 text-left">Số khối áp dụng</th>
                  {gradesData &&
                    gradesData.map((grade) => (
                      <th
                        key={grade.gradeLevelId}
                        className={`border-r p-2 text-center last:border-r-0 ${
                          !enabledGrades[grade.gradeLevelId]
                            ? "bg-gray-100"
                            : ""
                        }`}
                      >
                        <label className="flex cursor-pointer items-center justify-center gap-2 select-none">
                          {grade.gradeName}
                          <input
                            type="checkbox"
                            checked={enabledGrades[grade.gradeLevelId]}
                            onChange={() =>
                              handleGradeToggle(grade.gradeLevelId)
                            }
                            className="h-4 w-4"
                          />
                        </label>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {/* Example for one row, apply to all rows */}
                <tr className="border-b">
                  <td className="border-r p-2">Số tiết HK1</td>
                  {gradesData?.map((grade, index) => (
                    <td
                      key={`${grade.gradeLevelId}-hk1`}
                      className={`border-r p-2 text-center last:border-r-0 ${
                        !enabledGrades[grade.gradeLevelId] ? "bg-gray-100" : ""
                      }`}
                    >
                      <input
                        type="text"
                        className={`h-10 w-20 rounded-md px-3 py-2 text-center text-sm focus-visible:outline-none ${
                          errors.gradesData?.[index]?.periodsPerWeekHKI ||
                          (enabledGrades[grade.gradeLevelId] &&
                            !grade.periodsPerWeekHKI &&
                            grade.periodsPerWeekHKI !== 0)
                            ? "border-2 border-red-500"
                            : ""
                        }`}
                        value={grade.periodsPerWeekHKI ?? ""}
                        onChange={(e) =>
                          handleNumericInput(e, index, "periodsPerWeekHKI")
                        }
                        disabled={!enabledGrades[grade.gradeLevelId]}
                        maxLength={2}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="border-r p-2">Số tiết HK2</td>
                  {gradesData?.map((grade, index) => (
                    <td
                      key={`${grade.gradeLevelId}-hk2`}
                      className={`border-r p-2 text-center last:border-r-0 ${
                        !enabledGrades[grade.gradeLevelId] ? "bg-gray-100" : ""
                      }`}
                    >
                      <input
                        type="text"
                        className={`h-10 w-20 rounded-md px-3 py-2 text-center text-sm focus-visible:outline-none ${
                          errors.gradesData?.[index]?.periodsPerWeekHKII ||
                          (enabledGrades[grade.gradeLevelId] &&
                            !grade.periodsPerWeekHKII &&
                            grade.periodsPerWeekHKII !== 0)
                            ? "border-2 border-red-500"
                            : ""
                        }`}
                        value={grade.periodsPerWeekHKII ?? ""}
                        onChange={(e) =>
                          handleNumericInput(e, index, "periodsPerWeekHKII")
                        }
                        disabled={!enabledGrades[grade.gradeLevelId]}
                        maxLength={2}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="border-r p-2">Số điểm ĐGTX HK1</td>
                  {gradesData?.map((grade, index) => (
                    <td
                      key={`${grade.gradeLevelId}-dgtx1`}
                      className={`border-r p-2 text-center last:border-r-0 ${
                        !enabledGrades[grade.gradeLevelId] ? "bg-gray-100" : ""
                      }`}
                    >
                      <input
                        type="text"
                        className={`h-10 w-20 rounded-md px-3 py-2 text-center text-sm focus-visible:outline-none ${
                          errors.gradesData?.[index]
                            ?.continuousAssessmentsHKI ||
                          (enabledGrades[grade.gradeLevelId] &&
                            !grade.continuousAssessmentsHKI &&
                            grade.continuousAssessmentsHKI !== 0)
                            ? "border-2 border-red-500"
                            : ""
                        }`}
                        value={grade.continuousAssessmentsHKI ?? ""}
                        onChange={(e) =>
                          handleNumericInput(
                            e,
                            index,
                            "continuousAssessmentsHKI",
                          )
                        }
                        disabled={!enabledGrades[grade.gradeLevelId]}
                        maxLength={2}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="border-r p-2">Số điểm ĐGTX HK2</td>
                  {gradesData?.map((grade, index) => (
                    <td
                      key={`${grade.gradeLevelId}-dgtx2`}
                      className={`border-r p-2 text-center last:border-r-0 ${
                        !enabledGrades[grade.gradeLevelId] ? "bg-gray-100" : ""
                      }`}
                    >
                      <input
                        type="text"
                        className={`h-10 w-20 rounded-md px-3 py-2 text-center text-sm focus-visible:outline-none ${
                          errors.gradesData?.[index]
                            ?.continuousAssessmentsHKI ||
                          (enabledGrades[grade.gradeLevelId] &&
                            !grade.continuousAssessmentsHKII &&
                            grade.continuousAssessmentsHKII !== 0)
                            ? "border-2 border-red-500"
                            : ""
                        }`}
                        value={grade.continuousAssessmentsHKII ?? ""}
                        onChange={(e) =>
                          handleNumericInput(
                            e,
                            index,
                            "continuousAssessmentsHKII",
                          )
                        }
                        disabled={!enabledGrades[grade.gradeLevelId]}
                        maxLength={2}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="border-r p-2">Số điểm ĐGGK</td>
                  {gradesData?.map((grade, index) => (
                    <td
                      key={`${grade.gradeLevelId}-dggk`}
                      className={`border-r p-2 text-center last:border-r-0 ${
                        !enabledGrades[grade.gradeLevelId] ? "bg-gray-100" : ""
                      }`}
                    >
                      <input
                        type="text"
                        className={`h-10 w-20 rounded-md px-3 py-2 text-center text-sm focus-visible:outline-none ${
                          errors.gradesData?.[index]?.midtermAssessments ||
                          (enabledGrades[grade.gradeLevelId] &&
                            !grade.midtermAssessments &&
                            grade.midtermAssessments !== 0)
                            ? "border-2 border-red-500"
                            : ""
                        }`}
                        value={grade.midtermAssessments ?? ""}
                        onChange={(e) =>
                          handleNumericInput(e, index, "midtermAssessments")
                        }
                        disabled={!enabledGrades[grade.gradeLevelId]}
                        maxLength={2}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="border-r p-2">Số điểm ĐGCK</td>
                  {gradesData?.map((grade, index) => (
                    <td
                      key={`${grade.gradeLevelId}-dgck`}
                      className={`border-r p-2 text-center last:border-r-0 ${
                        !enabledGrades[grade.gradeLevelId] ? "bg-gray-100" : ""
                      }`}
                    >
                      <input
                        type="text"
                        className={`h-10 w-20 rounded-md px-3 py-2 text-center text-sm focus-visible:outline-none ${
                          errors.gradesData?.[index]?.finalAssessments ||
                          (enabledGrades[grade.gradeLevelId] &&
                            !grade.finalAssessments &&
                            grade.finalAssessments !== 0)
                            ? "border-2 border-red-500"
                            : ""
                        }`}
                        value={grade.finalAssessments ?? ""}
                        onChange={(e) =>
                          handleNumericInput(e, index, "finalAssessments")
                        }
                        disabled={!enabledGrades[grade.gradeLevelId]}
                        maxLength={2}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            {Object.values(errors.gradesData || {}).some((error) => error) && (
              <p className="mt-2 text-sm text-red-500">
                Vui lòng điền đầy đủ thông tin cho các khối được chọn
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit">Lưu môn học</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
