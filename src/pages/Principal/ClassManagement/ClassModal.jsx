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
import { useHomeroomTeachers } from "@/services/principal/queries";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateClass } from "@/services/principal/mutation";

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
  classStatus: z.boolean(),
});

export default function ClassModal({ open, onOpenChange, currentYear }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(classSchema),
    defaultValues: {
      gradeLevelId: "",
      className: "",
      homeroomTeacherHK1: "",
      homeroomTeacherHK2: "",
      classStatus: false,
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const semesterQuery = useSemestersByAcademicYear(currentYear?.academicYearID);
  const gradelevelQuery = useGradeLevels();
  const teacherQuery = useTeachers();
  const hoomroomsTeachers = useHomeroomTeachers();
  const createClassMutation = useCreateClass();

  const semester1 = semesterQuery?.data?.find(
    (semester) => semester.semesterName === "Học kỳ 1",
  );
  const semester2 = semesterQuery?.data?.find(
    (semester) => semester.semesterName === "Học kỳ 2",
  );

  const availableTeachersHK1 =
    teacherQuery?.data?.teachers?.filter((teacher) => {
      // Check if this teacher is already assigned as homeroom teacher for semester1
      return !hoomroomsTeachers?.data?.some(
        (homeroom) =>
          homeroom.teacherId === teacher.teacherId &&
          homeroom.semesterId === semester1?.semesterID,
      );
    }) || [];

  const availableTeachersHK2 =
    teacherQuery?.data?.teachers?.filter((teacher) => {
      // Check if this teacher is already assigned as homeroom teacher for semester1
      return !hoomroomsTeachers?.data?.some(
        (homeroom) =>
          homeroom.teacherId === teacher.teacherId &&
          homeroom.semesterId === semester2?.semesterID,
      );
    }) || [];

  const onSubmit = (values) => {
    const homerooms = [];
    if (values.homeroomTeacherHK1) {
      homerooms.push({
        teacherId: Number(values.homeroomTeacherHK1),
        semesterId: semester1?.semesterID,
      });
    }
    if (values.homeroomTeacherHK2) {
      homerooms.push({
        teacherId: Number(values.homeroomTeacherHK2),
        semesterId: semester2?.semesterID,
      });
    }
    const data = {
      academicYearId: currentYear?.academicYearID,
      className: values.className,
      gradeLevelId: values.gradeLevelId
        ? Number(values.gradeLevelId)
        : undefined,
      status: values.classStatus ? "Hoạt Động" : "Không Hoạt Động",
      homerooms,
    };
    console.log(data);
    createClassMutation.mutate(data, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
    // reset();
  };

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Lớp Học Mới</DialogTitle>
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
            <Controller
              name="classStatus"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="classStatus"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="classStatus" className="mb-0">
              Hoạt động
            </Label>
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
          >
            Thêm
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
