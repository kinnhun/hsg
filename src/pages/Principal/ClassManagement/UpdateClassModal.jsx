import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  useGradeLevels,
  useSemestersByAcademicYear,
} from "@/services/common/queries";
import { useTeachers } from "@/services/teacher/queries";
import { useClass, useHomeroomTeachers } from "@/services/principal/queries";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateClass } from "@/services/principal/mutation";

const classSchema = z.object({
  gradeLevelId: z.string().min(1, "Vui lòng chọn khối"),
  className: z
    .string()
    .min(2, "Tên lớp phải có ít nhất 2 kí tự")
    .max(5, "Tên lớp tối đa 5 kí tự")
    .regex(
      /^[A-Za-z0-9]{2,5}$/,
      "Tên lớp không được chứa ký tự đặc biệt hoặc dấu cách",
    )
    .refine((val) => /[A-Za-z]/.test(val), {
      message: "Tên lớp phải chứa ít nhất 1 chữ cái",
    }),
  homeroomTeacherHK1: z.string().optional(),
  homeroomTeacherHK2: z.string().optional(),
});

export default function UpdateClassModal({
  open,
  onOpenChange,
  classId,
  currentYear,
}) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(classSchema),
    defaultValues: {
      gradeLevelId: "",
      className: "",
      homeroomTeacherHK1: "",
      homeroomTeacherHK2: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const classQuery = useClass(classId);
  const semesterQuery = useSemestersByAcademicYear(currentYear?.academicYearID);
  const gradelevelQuery = useGradeLevels();
  const teacherQuery = useTeachers();
  const homeroomTeachers = useHomeroomTeachers();
  const updateClassMutation = useUpdateClass();
  const [classStatus, setClassStatus] = useState(false);
  const [teacherHK1Status, setTeacherHK1Status] = useState(false);
  const [teacherHK2Status, setTeacherHK2Status] = useState(false);

  const semester1 = semesterQuery?.data?.find(
    (semester) => semester.semesterName === "Học kỳ 1",
  );
  const semester2 = semesterQuery?.data?.find(
    (semester) => semester.semesterName === "Học kỳ 2",
  );

  const availableTeachersHK1 =
    teacherQuery?.data?.teachers?.filter((teacher) => {
      return !homeroomTeachers?.data?.some(
        (homeroom) =>
          homeroom.teacherId === teacher.teacherId &&
          homeroom.semesterId === semester1?.semesterID &&
          homeroom.classId !== classId,
      );
    }) || [];

  const availableTeachersHK2 =
    teacherQuery?.data?.teachers?.filter((teacher) => {
      return !homeroomTeachers?.data?.some(
        (homeroom) =>
          homeroom.teacherId === teacher.teacherId &&
          homeroom.semesterId === semester2?.semesterID &&
          homeroom.classId !== classId,
      );
    }) || [];

  const onSubmit = (values) => {
    const homerooms = [];
    if (values.homeroomTeacherHK1) {
      homerooms.push({
        classId: classId,
        teacherId: Number(values.homeroomTeacherHK1),
        semesterId: semester1?.semesterID,
        status: teacherHK1Status ? "Hoạt Động" : "Không Hoạt Động",
      });
    }
    if (values.homeroomTeacherHK2) {
      homerooms.push({
        classId: classId,
        teacherId: Number(values.homeroomTeacherHK2),
        semesterId: semester2?.semesterID,
        status: teacherHK2Status ? "Hoạt Động" : "Không Hoạt Động",
      });
    }
    const data = {
      classId: classId,
      className: values.className,
      academicYearId: currentYear?.academicYearID,
      gradeLevelId: values.gradeLevelId
        ? Number(values.gradeLevelId)
        : undefined,
      status: classStatus ? "Hoạt động" : "Không hoạt động",
      homerooms,
    };
    console.log(data);
    updateClassMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  useEffect(() => {
    if (classQuery.data) {
      const classData = classQuery.data;
      // Find homeroom teachers for each semester
      const homeroomHK1 = homeroomTeachers?.data?.find(
        (t) =>
          t.semesterName === "Học kỳ 1" &&
          t.classId === classId &&
          t.semesterId === semester1?.semesterID,
      );

      const homeroomHK2 = homeroomTeachers?.data?.find(
        (t) =>
          t.semesterName === "Học kỳ 2" &&
          t.classId === classId &&
          t.semesterId === semester2?.semesterID,
      );

      console.log(homeroomHK2);

      reset({
        gradeLevelId: classData.gradeLevelId
          ? String(classData.gradeLevelId)
          : "",
        className: classData.className || "",
        homeroomTeacherHK1: homeroomHK1?.teacherId
          ? String(homeroomHK1.teacherId)
          : "",
        homeroomTeacherHK2: homeroomHK2?.teacherId
          ? String(homeroomHK2.teacherId)
          : "",
      });

      setClassStatus(classData.status === "Hoạt động");
      setTeacherHK1Status(false);
      setTeacherHK2Status(false);
    }
  }, [classQuery.data, homeroomTeachers.data, reset]);

  const isLoading =
    classQuery.isLoading ||
    semesterQuery.isLoading ||
    teacherQuery.isLoading ||
    homeroomTeachers.isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật lớp học</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="gradeId">Khối</Label>
            <Controller
              name="gradeLevelId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value}
                  onValueChange={field.onChange}
                  required
                >
                  <SelectTrigger id="gradeId" className="w-full">
                    <SelectValue placeholder="Chọn khối" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradelevelQuery?.data?.map((grade) => (
                      <SelectItem
                        key={grade.gradeLevelId}
                        value={grade.gradeLevelId + ""}
                      >
                        {grade.gradeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gradeLevelId && (
              <span className="text-sm text-red-500">
                {errors.gradeLevelId.message}
              </span>
            )}
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="className">Tên Lớp</Label>
            <Controller
              name="className"
              control={control}
              render={({ field }) => <Input {...field} id="className" />}
            />
            {errors.className && (
              <span className="text-sm text-red-500">
                {errors.className.message}
              </span>
            )}
          </div>

          <div className="grid w-full gap-2">
            <Label htmlFor="homeroomTeacherHK1">
              Giáo Viên Chủ Nhiệm Học Kỳ 1
            </Label>
            <Controller
              name="homeroomTeacherHK1"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="homeroomTeacherHK1" className="w-full">
                    <SelectValue placeholder="Chọn giáo viên" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeachersHK1?.map((teacher) => (
                      <SelectItem
                        key={teacher.teacherId}
                        value={teacher.teacherId + ""}
                      >
                        {teacher.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.homeroomTeacherHK1 && (
              <span className="text-sm text-red-500">
                {errors.homeroomTeacherHK1.message}
              </span>
            )}
          </div>

          <div className="grid w-full gap-2">
            <Label htmlFor="homeroomTeacherHK2">
              Giáo Viên Chủ Nhiệm Học Kỳ 2
            </Label>
            <Controller
              name="homeroomTeacherHK2"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="homeroomTeacherHK2" className="w-full">
                    <SelectValue placeholder="Chọn giáo viên" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeachersHK2?.map((teacher) => (
                      <SelectItem
                        key={teacher.teacherId}
                        value={teacher.teacherId + ""}
                      >
                        {teacher.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.homeroomTeacherHK2 && (
              <span className="text-sm text-red-500">
                {errors.homeroomTeacherHK2.message}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="classStatus"
              checked={classStatus}
              onCheckedChange={(checked) => {
                setClassStatus(checked);
              }}
              className="cursor-pointer"
            />
            <Label htmlFor="classStatus" className="mb-0 cursor-pointer">
              Hoạt động lớp
            </Label>
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
          >
            Cập nhật
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
