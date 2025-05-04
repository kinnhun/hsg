import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useNavigate, useParams } from "react-router";
import { useTeacher } from "@/services/teacher/queries";
import { useUpdateTeacher } from "@/services/teacher/mutation";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/DatePicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDate } from "@/helpers/formatDate";
import { useEffect } from "react";
import { cleanString } from "@/helpers/removeWhiteSpace";

export default function TeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const teacherQuery = useTeacher(id);
  const { mutate, isPending: isUpdating } = useUpdateTeacher();
  const employmentTypes = [
    "Hợp đồng lao động dưới 1 năm",
    "Viên chức HĐLV không xác định thời hạn",
    "Hợp đồng thuê khoán",
  ];

  const teacherSchema = z.object({
    // Basic info
    fullName: z
      .string()
      .min(1, "Họ và tên không được để trống")
      .max(25, "Họ và tên tối đa 25 kí tự")
      .regex(
        /^[\p{L}\s]+$/u,
        "Họ và tên không được chứa số hoặc ký tự đặc biệt",
      ),
    position: z
      .string()
      .min(1, "Vui lòng điền vị trí việc làm")
      .max(25, "Vị trí tối đa 25 kí tự")
      .regex(
        /^[\p{L}\s]+$/u,
        "Vị trí việc làm không được chứa số hoặc ký tự đặc biệt",
      ),
    department: z.string().min(1, "Vui lòng chọn tổ bộ môn"),

    // Personal information
    gender: z.string().min(1, "Vui lòng chọn giới tính"),
    dob: z
      .date()
      .nullable()
      .superRefine((val, ctx) => {
        if (val === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Vui lòng chọn ngày sinh",
          });
        }
      }),
    idcardNumber: z
      .string()
      .min(1, "Số CCCD không được để trống")
      .refine((val) => val.length === 12, "Số CCCD phải có chính xác 12 chữ số")
      .refine((val) => /^\d+$/.test(val), "Số CCCD chỉ được chứa chữ số"),
    hometown: z
      .string()
      .min(1, "Quê quán không được để trống")
      .max(100, "Quê quán tối đa 200 kí tự")
      .regex(
        /^[\p{L}\s]+$/u,
        "Quê quán không được chứa số hoặc ký tự đặc biệt",
      ),
    ethnicity: z
      .string()
      .min(1, "Dân tộc không được để trống")
      .max(20, "Dân tộc tối đa 20 kí tự")
      .regex(/^[\p{L}\s]+$/u, "Dân tộc không được chứa số hoặc ký tự đặc biệt"),
    religion: z
      .string()
      .min(1, "Tôn giáo không được để trống")
      .max(20, "Tôn giáo tối đa 20 kí tự")
      .regex(
        /^[\p{L}\s]+$/u,
        "Tôn giáo không được chứa số hoặc ký tự đặc biệt",
      ),
    maritalStatus: z.string().min(1, "Vui lòng chọn tình trạng hôn nhân"),

    permanentAddress: z
      .string()
      .min(1, "Địa chỉ không được để trống")
      .max(200, "Địa chỉ tối đa 200 kí tự"),
    // Employment information
    mainSubject: z.string().optional(),
    isHeadOfDepartment: z.boolean().optional().default(false),
    employmentType: z.string().min(1, "Vui lòng chọn loại hợp đồng"),
    employmentStatus: z.string().min(1, "Vui lòng chọn trạng thái"),
    recruitmentAgency: z
      .string()
      .max(50, "Cơ quan tuyển dụng tối đa 50 kí tự")
      .regex(
        /^[\p{L}\s]*$/u,
        "Cơ quan tuyển dụng không được chứa số hoặc ký tự đặc biệt",
      )
      .optional(),
    insuranceNumber: z
      .string()
      .min(10, "Số bảo hiểm phải có đúng 10 chữ số")
      .max(10, "Số bảo hiểm phải có đúng 10 chữ số")
      .regex(/^\d{10}$/, "Số bảo hiểm phải là 10 chữ số"),

    // Employment dates
    hiringDate: z
      .date()
      .nullable()
      .superRefine((val, ctx) => {
        if (val === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Vui lòng chọn ngày tuyển dụng",
          });
        }
      }),
    schoolJoinDate: z
      .date()
      .nullable()
      .superRefine((val, ctx) => {
        if (val === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Vui lòng chọn ngày vào trường",
          });
        }
      }),
    permanentEmploymentDate: z.date().nullable(),
    phoneNumber: z
      .string()
      .min(10, "Số điện thoại phải có ít nhất 10 chữ số")
      .max(11, "Số điện thoại không được quá 11 chữ số")
      .regex(
        /^(0[2-9]|84[2-9])\d{8}$/,
        "Số điện thoại không hợp lệ. Phải bắt đầu bằng 0 hoặc +84 và có 10-11 chữ số",
      ),
    email: z.string().email("Email không hợp lệ"),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      fullName: "",
      position: "",
      department: "",
      gender: "",
      dob: null,
      idcardNumber: "",
      hometown: "",
      ethnicity: "",
      religion: "",
      maritalStatus: "",
      permanentAddress: "",
      mainSubject: "",
      isHeadOfDepartment: false,
      employmentType: "",
      employmentStatus: "",
      recruitmentAgency: "",
      insuranceNumber: "",
      hiringDate: null,
      schoolJoinDate: null,
      permanentEmploymentDate: null,
      phoneNumber: "",
      email: "",
    },
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  useEffect(() => {
    if (teacherQuery.data) {
      const teacher = teacherQuery.data;
      const mainSubjectString = teacher?.subjects
        ?.map((s) => (s.isMainSubject ? `${s.subjectName}*` : s.subjectName))
        .join(", ");
      reset({
        ...teacher,
        mainSubject: mainSubjectString,
        dob: teacher.dob ? new Date(teacher.dob) : null,
        hiringDate: teacher.hiringDate ? new Date(teacher.hiringDate) : null,
        schoolJoinDate: teacher.schoolJoinDate
          ? new Date(teacher.schoolJoinDate)
          : null,
        permanentEmploymentDate: teacher.permanentEmploymentDate
          ? new Date(teacher.permanentEmploymentDate)
          : null,
      });
    }
  }, [teacherQuery.data, reset]);

  // Submit handler
  const onSubmit = (formData) => {
    // Clean all string data
    const cleanedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, cleanString(value)]),
    );

    const subjects = cleanedData.mainSubject
      ? cleanedData.mainSubject.split(",").map((s) => {
          const trimmedSubject = s.trim();
          if (trimmedSubject.includes("*")) {
            return {
              subjectName: trimmedSubject.replace(/\s*\*\s*/g, "").trim(),
              isMainSubject: true,
            };
          }
          return {
            subjectName: trimmedSubject,
            isMainSubject: false,
          };
        })
      : [];

    const processedData = {
      ...cleanedData,
      teacherId: id,
      subjects,
      dob: cleanedData.dob ? formatDate(cleanedData.dob) : null,
      hiringDate: cleanedData.hiringDate
        ? formatDate(cleanedData.hiringDate)
        : null,
      schoolJoinDate: cleanedData.schoolJoinDate
        ? formatDate(cleanedData.schoolJoinDate)
        : null,
      permanentEmploymentDate: cleanedData.permanentEmploymentDate
        ? formatDate(cleanedData.permanentEmploymentDate)
        : null,
    };
    console.log(processedData);
    mutate(
      { id, data: processedData },
      {
        onSuccess: () => {
          reset();
        },
      },
    );
  };

  // Form field component
  const FormField = ({
    name,
    label,
    type = "text",
    options,
    isRequired = false,
    note,
  }) => {
    const error = errors[name];

    const renderLabel = () => (
      <Label htmlFor={name} className="flex items-center gap-2">
        <span>
          {label}
          {isRequired && <span className="ml-1 text-red-500">*</span>}
        </span>
        {note && <span className="text-sm text-gray-500">({note})</span>}
      </Label>
    );

    // Select field
    if (type === "select" && Array.isArray(options)) {
      return (
        <div className="space-y-2">
          {renderLabel()}
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger>
                  <SelectValue placeholder={`Chọn ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {error && <p className="text-sm text-red-500">{error.message}</p>}
        </div>
      );
    }

    // Boolean field (Switch)
    if (type === "boolean") {
      return (
        <div className="flex items-center justify-between">
          {renderLabel()}
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Switch
                id={name}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          {error && <p className="text-sm text-red-500">{error.message}</p>}
        </div>
      );
    }

    // Date field
    if (type === "date") {
      return (
        <div className="space-y-2">
          {renderLabel()}
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <DatePicker value={field.value} onSelect={field.onChange} />
            )}
          />
          {error && <p className="text-sm text-red-500">{error.message}</p>}
        </div>
      );
    }

    // Default text input
    return (
      <div className="space-y-2">
        {renderLabel()}
        <Input id={name} {...register(name)} />
        {error && <p className="text-sm text-red-500">{error.message}</p>}
      </div>
    );
  };
  return (
    <>
      <Button
        onClick={() => navigate("/teacher/profile")}
        className="mt-2 cursor-pointer bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700"
      >
        Quay lại
      </Button>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="container mx-auto space-y-6 py-6"
      >
        {/* Header with title and save button */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Thông tin giáo viên</h1>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isUpdating}
              className="cursor-pointer bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700"
            >
              {isUpdating ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField name="fullName" label="Họ và tên" isRequired />
            <FormField name="position" label="Vị trí việc làm" isRequired />
            <FormField
              name="department"
              label="Tổ bộ môn"
              type="select"
              options={["Khoa học xã hội", "Khoa học tự nhiên", "Toàn trường"]}
              isRequired
            />
            <FormField
              name="gender"
              label="Giới tính"
              type="select"
              options={["Nam", "Nữ", "Khác"]}
              isRequired
            />
            <FormField name="dob" label="Ngày sinh" type="date" isRequired />
            <FormField
              name="phoneNumber"
              label="Số điện thoại"
              isRequired
            />{" "}
            <FormField name="email" label="Email" isRequired />
            <FormField name="idcardNumber" label="Số CMND/CCCD" isRequired />
            <FormField name="hometown" label="Quê quán" isRequired />
            <FormField name="ethnicity" label="Dân tộc" isRequired />
            <FormField name="religion" label="Tôn giáo" isRequired />
            <FormField
              name="maritalStatus"
              label="Tình trạng hôn nhân"
              type="select"
              options={["Độc thân", "Đã kết hôn", "Ly hôn", "Góa"]}
              isRequired
            />
            <FormField
              name="permanentAddress"
              label="Địa chỉ thường trú"
              isRequired
            />
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin công việc</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              name="mainSubject"
              label="Môn dạy"
              note="Môn dạy chính có dấu * ở cuối, mỗi môn học cách nhau bằng với phẩy. Ví dụ: Toán*, Văn"
            />
            <FormField
              name="isHeadOfDepartment"
              label="Tổ trưởng bộ môn"
              type="boolean"
            />
            <FormField
              name="employmentType"
              label="Loại hợp đồng"
              type="select"
              options={employmentTypes}
              isRequired
            />
            <FormField
              name="employmentStatus"
              label="Trạng thái"
              type="select"
              options={["Đang làm việc", "Đã nghỉ việc"]}
              isRequired
            />
            <FormField
              name="recruitmentAgency"
              label="Cơ quan tuyển dụng"
              isRequired
            />
            <FormField name="insuranceNumber" label="Số bảo hiểm" isRequired />
            <FormField
              name="hiringDate"
              label="Ngày tuyển dụng"
              type="date"
              isRequired
            />
            <FormField
              name="schoolJoinDate"
              label="Ngày vào trường"
              type="date"
              isRequired
            />
            <FormField
              name="permanentEmploymentDate"
              label="Ngày vào biên chế"
              type="date"
              isRequired
            />
          </CardContent>
        </Card>

        {/* Submit buttons at bottom for convenience */}
        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={isUpdating}
            className="cursor-pointer bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700"
          >
            {isUpdating ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </form>
    </>
  );
}
