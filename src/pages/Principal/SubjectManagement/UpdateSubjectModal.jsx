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
import { useUpdateSubject } from "@/services/principal/mutation";
import { useGradeLevels } from "@/services/common/queries";
import { cleanString } from "@/helpers/removeWhiteSpace";
import {
  useSubjectConfigueDetail,
  useSubjectDetail,
} from "@/services/principal/queries";

// Add schema definition
const subjectSchema = z.object({
  subjectName: z.string().min(1, "Tên môn học không được để trống"),
  subjectCategory: z.string().min(1, "Vui lòng chọn tổ bộ môn"),
  typeOfGrade: z.string().min(1, "Vui lòng chọn hình thức tính điểm"),
  gradesData: z.array(
    z.object({
      gradeLevelId: z.number(),
      gradeLevelSubjectId: z.number().optional(),
      periodsPerWeekHKI: z.number().nullable(),
      periodsPerWeekHKII: z.number().nullable(),
      continuousAssessmentsHKI: z.number().nullable(),
      continuousAssessmentsHKII: z.number().nullable(),
      midtermAssessments: z.number().nullable(),
      finalAssessments: z.number().nullable(),
    }),
  ),
});

export const UpdateSubjectModal = ({
  subjectId,
  open,
  setOpen,
  setSelectedSubjectId,
}) => {
  const gradeLevelsQuery = useGradeLevels();
  const subjectDetailQuery = useSubjectDetail(subjectId);
  const subjectConfigDetailQuery = useSubjectConfigueDetail(subjectId, {
    enabled: !!subjectId,
  });

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
    defaultValues: {
      subjectName: "",
      subjectCategory: "",
      typeOfGrade: "",
    },
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const updateSubjectMutation = useUpdateSubject();

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
    if (open && subjectDetailQuery.data && gradeLevelsQuery.data) {
      const subjectInfo = subjectDetailQuery.data;

      // Tạo object dữ liệu để reset form
      const formData = {
        subjectName: (subjectInfo.subjectName || "").trim(),
        subjectCategory: (subjectInfo.subjectCategory || "").trim(),
        typeOfGrade: (subjectInfo.typeOfGrade || "").trim(),
        gradesData: gradeLevelsQuery.data?.map((gradeLevel) => {
          const gradeData = subjectConfigDetailQuery?.data?.find(
            (item) => item.gradeLevelId === gradeLevel.gradeLevelId,
          );
          return {
            gradeLevelId: gradeLevel.gradeLevelId,
            gradeLevelSubjectId: gradeData?.gradeLevelSubjectId,
            gradeName: gradeLevel.gradeName,
            periodsPerWeekHKI: gradeData?.periodsPerWeekHKI ?? 4,
            periodsPerWeekHKII: gradeData?.periodsPerWeekHKII ?? 4,
            continuousAssessmentsHKI: gradeData?.continuousAssessmentsHKI ?? 4,
            continuousAssessmentsHKII:
              gradeData?.continuousAssessmentsHKII ?? 4,
            midtermAssessments: gradeData?.midtermAssessments ?? 1,
            finalAssessments: gradeData?.finalAssessments ?? 1,
          };
        }),
      };

      reset(formData);
      // Update enabled grades
      const newEnabledGrades = {};
      const subjectConfigDetail = subjectConfigDetailQuery.error
        ? []
        : subjectConfigDetailQuery.data;
      console.log(subjectConfigDetailQuery.data);
      gradeLevelsQuery.data.forEach((gradeLevel) => {
        const hasData =
          subjectConfigDetailQuery.data?.some(
            (item) => item.gradeLevelId === gradeLevel.gradeLevelId,
          ) ?? false;
        newEnabledGrades[gradeLevel.gradeLevelId] = hasData;
      });

      setEnabledGrades(newEnabledGrades);
    }
  }, [
    open,
    subjectDetailQuery.data,
    subjectConfigDetailQuery.data,
    gradeLevelsQuery.data,
    reset,
  ]);

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
        return (
          key !== "gradeLevelId" &&
          key !== "gradeLevelSubjectId" &&
          key !== "gradeName" &&
          value === null
        );
      });
    });

    if (hasNullInEnabledGrades) {
      toast.error("Vui lòng điền đầy đủ thông tin cho các khối được chọn");
      return;
    }

    const cleanedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, cleanString(value)]),
    );

    const originalGrades = subjectConfigDetailQuery?.data || [];
    const newGrades = data.gradesData.filter(
      (grade) => enabledGrades[grade.gradeLevelId],
    );

    const modifiedGradesData = newGrades.map((grade) => {
      const isNewGrade = !originalGrades.some(
        (og) => og.gradeLevelId === grade.gradeLevelId,
      );
      return {
        ...grade,
        subjectId: subjectId,
        gradeLevelSubjectId: isNewGrade ? null : grade.gradeLevelSubjectId,
        status: isNewGrade ? "add" : "update",
      };
    });

    const deletedGrades = originalGrades
      .filter(
        (og) => !newGrades.some((ng) => ng.gradeLevelId === og.gradeLevelId),
      )
      .map((grade) => ({
        ...grade,
        subjectId: subjectId,
        status: "delete",
      }));

    const filteredData = {
      subjectId: subjectId,
      ...cleanedData,
      gradesData: [...modifiedGradesData, ...deletedGrades],
    };

    console.log(filteredData);

    updateSubjectMutation.mutate(filteredData, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  const handleModalClose = () => {
    setOpen(false);
    setSelectedSubjectId(null);
    reset({
      subjectName: "",
      subjectCategory: "",
      typeOfGrade: "",
      gradesData: [],
    });
    setEnabledGrades({});
  };

  const isLoading =
    subjectDetailQuery.isLoading ||
    subjectConfigDetailQuery.isLoading ||
    gradeLevelsQuery.isLoading;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          handleModalClose();
        } else {
          setOpen(true);
        }
      }}
    >
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Cập nhật học mới</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div>Đang tải dữ liệu...</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject-name">Tên môn học</Label>
              <Input
                id="subject-name"
                className="h-10 w-full px-3 py-2 text-sm"
                value={watch("subjectName")}
                onChange={(e) => setValue("subjectName", e.target.value)}
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
                value={watch("subjectCategory")}
                onValueChange={(value) => {
                  if (value) {
                    setValue("subjectCategory", value);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn tổ bộ môn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Khoa học tự nhiên">
                    Khoa học tự nhiên
                  </SelectItem>
                  <SelectItem value="Khoa học xã hội">
                    Khoa học xã hội
                  </SelectItem>
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
                value={watch("typeOfGrade")}
                onValueChange={(value) => {
                  if (value) {
                    setValue("typeOfGrade", value);
                  }
                }}
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
                          !enabledGrades[grade.gradeLevelId]
                            ? "bg-gray-100"
                            : ""
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
                          !enabledGrades[grade.gradeLevelId]
                            ? "bg-gray-100"
                            : ""
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
                          !enabledGrades[grade.gradeLevelId]
                            ? "bg-gray-100"
                            : ""
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
                          !enabledGrades[grade.gradeLevelId]
                            ? "bg-gray-100"
                            : ""
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
                          !enabledGrades[grade.gradeLevelId]
                            ? "bg-gray-100"
                            : ""
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
                          !enabledGrades[grade.gradeLevelId]
                            ? "bg-gray-100"
                            : ""
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
              {Object.values(errors.gradesData || {}).some(
                (error) => error,
              ) && (
                <p className="mt-2 text-sm text-red-500">
                  Vui lòng điền đầy đủ thông tin cho các khối được chọn
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit">Lưu môn học</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
