import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DatePicker from "@/components/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateStudent } from "@/services/student/mutation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLayout } from "@/layouts/DefaultLayout/DefaultLayout";
import { useClasses } from "@/services/common/queries";
import { formatDate } from "@/helpers/formatDate";
import { useState } from "react";
import { useStudents } from "@/services/student/queries";
import { cleanString } from "@/helpers/removeWhiteSpace";
import { X } from "lucide-react";
import { useNavigate } from "react-router";

export default function AddStudent() {
  const navigate = useNavigate();
  const { currentYear } = useLayout();
  const classQuery = useClasses();
  const academicYearId = currentYear?.academicYearID;
  const { mutate, isPending: isUpdating } = useCreateStudent();

  // State để lưu trữ checkbox nào được chọn
  const [showFatherInfo, setShowFatherInfo] = useState(false);
  const [showMotherInfo, setShowMotherInfo] = useState(false);
  const [showGuardianInfo, setShowGuardianInfo] = useState(false);
  const [showSiblingsModal, setShowSiblingsModal] = useState(false);
  const [selectedSibling, setSelectedSibling] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const studentsQuery = useStudents(academicYearId);
  const filteredStudents = studentsQuery.data?.students?.filter((student) =>
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleChangeSibling = (student) => {
    console.log(student);
    const currentValues = watch();
    const parentInfo = {};

    if (student?.parent?.fullNameFather) {
      setShowFatherInfo(true);
      Object.assign(parentInfo, {
        fullNameFather: student.parent.fullNameFather,
        yearOfBirthFather: student.parent.yearOfBirthFather
          ? new Date(student.parent.yearOfBirthFather)
          : null,
        occupationFather: student.parent.occupationFather || "",
        phoneNumberFather: student.parent.phoneNumberFather || "",
        emailFather: student.parent.emailFather || "",
        idcardNumberFather: student.parent.idcardNumberFather || "",
      });
    } else {
      setShowFatherInfo(false);
    }

    if (student?.parent?.fullNameMother) {
      setShowMotherInfo(true);
      Object.assign(parentInfo, {
        fullNameMother: student.parent.fullNameMother,
        yearOfBirthMother: student.parent.yearOfBirthMother
          ? new Date(student.parent.yearOfBirthMother)
          : null,
        occupationMother: student.parent.occupationMother || "",
        phoneNumberMother: student.parent.phoneNumberMother || "",
        emailMother: student.parent.emailMother || "",
        idcardNumberMother: student.parent.idcardNumberMother || "",
      });
    } else {
      setShowMotherInfo(false);
    }

    if (student?.parent?.fullNameGuardian) {
      setShowGuardianInfo(true);
      Object.assign(parentInfo, {
        fullNameGuardian: student.parent.fullNameGuardian,
        yearOfBirthGuardian: student.parent.yearOfBirthGuardian
          ? new Date(student.parent.yearOfBirthGuardian)
          : null,
        occupationGuardian: student.parent.occupationGuardian || "",
        phoneNumberGuardian: student.parent.phoneNumberGuardian || "",
        emailGuardian: student.parent.emailGuardian || "",
        idcardNumberGuardian: student.parent.idcardNumberGuardian || "",
      });
    } else {
      setShowGuardianInfo(false);
    }

    // Reset form with all parent info at once
    reset({
      ...currentValues,
      ...parentInfo,
    });
    setSelectedSibling(student);
  };

  const studentSchema = z
    .object({
      fullName: z
        .string()
        .min(1, "Họ và tên không được để trống")
        .max(25, "Họ và tên tối đa 25 kí tự")
        .regex(
          /^[\p{L}\s]+$/u,
          "Họ và tên không được chứa số hoặc ký tự đặc biệt",
        ),
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
      gender: z.string().min(1, "Vui lòng chọn giới tính"),
      classId: z.string().min(1, "Vui lòng chọn lớp"),
      admissionDate: z
        .date()
        .nullable()
        .superRefine((val, ctx) => {
          if (val === null) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Vui lòng chọn ngày nhập học",
            });
          }
        }),
      enrollmentType: z
        .string()
        .min(1, "Hình thức trúng tuyển không được để trống")
        .max(30, "Hình thức trúng tuyển tối đa 30 kí tự")
        .regex(
          /^[\p{L}\s]+$/u,
          "Hình thức trúng tuyển không được chứa số hoặc ký tự đặc biệt",
        ),
      ethnicity: z
        .string()
        .min(1, "Dân tộc không được để trống")
        .max(20, "Dân tộc tối đa 20 kí tự")
        .regex(
          /^[\p{L}\s]+$/u,
          "Dân tộc không được chứa số hoặc ký tự đặc biệt",
        ),
      permanentAddress: z
        .string()
        .min(1, "Địa chỉ thưởng trú không được để trống")
        .max(200, "Địa chỉ tối đa 200 kí tự"),
      birthPlace: z.string().min(1, "Nơi sinh không được để trống"),
      religion: z
        .string()
        .min(1, "Tôn giáo không được để trống")
        .max(20, "Tôn giáo tối đa 20 kí tự")
        .regex(
          /^[\p{L}\s]+$/u,
          "Tôn giáo không được chứa số hoặc ký tự đặc biệt",
        ),
      repeatingYear: z.boolean().default(false),
      idcardNumber: z
        .string()
        .min(1, "Số CCCD không được để trống")
        .refine(
          (val) => val.length === 12,
          "Số CCCD phải có chính xác 12 chữ số",
        )
        .refine((val) => /^\d+$/.test(val), "Số CCCD chỉ được chứa chữ số"),

      status: z.string().min(1, "Vui lòng chọn trạng thái"),

      // Father information
      fullNameFather: z.string().superRefine((val, ctx) => {
        if (showFatherInfo) {
          if (!val || val.trim().length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Họ và tên không được để trống",
            });
          } else if (val.length > 25) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Họ và tên tối đa 25 kí tự",
            });
          } else if (!/^[\p{L}\s]+$/u.test(val)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Họ và tên không được chứa số hoặc ký tự đặc biệt",
            });
          }
        }
        return z.NEVER;
      }),
      yearOfBirthFather: z
        .union([z.date(), z.null()])
        .refine((val) => !showFatherInfo || val !== null, {
          message: "Vui lòng chọn ngày sinh",
        }),
      occupationFather: z.string().superRefine((val, ctx) => {
        if (showFatherInfo) {
          if (!val || val.trim().length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Nghề nghiệp không được để trống",
            });
          } else if (val.length > 30) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Nghề nghiệp tối đa 30 kí tự",
            });
          } else if (!/^[\p{L}\s]+$/u.test(val)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Nghề nghiệp không được chứa số hoặc ký tự đặc biệt",
            });
          }
        }
        return z.NEVER;
      }),
      phoneNumberFather: z
        .string()
        .min(showFatherInfo ? 1 : 0, "Số điện thoại không được để trống")
        .refine((val) => !showFatherInfo || /^(0|\+84)[0-9]{9,10}$/.test(val), {
          message: "Số điện thoại không hợp lệ",
        }),
      emailFather: z
        .string()
        .email("Email không hợp lệ")
        .optional()
        .or(z.literal("")),
      idcardNumberFather: z
        .string()
        .superRefine((val, ctx) => {
          // Chỉ validate nếu showGuardianInfo là true
          if (showFatherInfo) {
            // Kiểm tra không được để trống
            if (!val || val.trim().length === 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Số CCCD không được để trống",
              });
            }
            // Kiểm tra độ dài 12 ký tự
            else if (val.length !== 12) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Số CCCD phải có chính xác 12 chữ số",
              });
            }
            // Kiểm tra chỉ chứa chữ số
            else if (!/^\d+$/.test(val)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Số CCCD chỉ được chứa chữ số",
              });
            }
          }
          return z.NEVER;
        })
        .optional(),

      // Mother information
      fullNameMother: z.string().superRefine((val, ctx) => {
        if (showMotherInfo) {
          if (!val || val.trim().length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Họ và tên không được để trống",
            });
          } else if (val.length > 25) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Họ và tên tối đa 25 kí tự",
            });
          } else if (!/^[\p{L}\s]+$/u.test(val)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Họ và tên không được chứa số hoặc ký tự đặc biệt",
            });
          }
        }
        return z.NEVER;
      }),
      yearOfBirthMother: z
        .union([z.date(), z.null()])
        .refine((val) => !showMotherInfo || val !== null, {
          message: "Vui lòng chọn ngày sinh",
        }),
      occupationMother: z.string().superRefine((val, ctx) => {
        if (showMotherInfo) {
          if (!val || val.trim().length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Nghề nghiệp không được để trống",
            });
          } else if (val.length > 30) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Nghề nghiệp tối đa 30 kí tự",
            });
          } else if (!/^[\p{L}\s]+$/u.test(val)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Nghề nghiệp không được chứa số hoặc ký tự đặc biệt",
            });
          }
        }
        return z.NEVER;
      }),
      phoneNumberMother: z
        .string()
        .min(showMotherInfo ? 1 : 0, "Số điện thoại không được để trống")
        .refine((val) => !showMotherInfo || /^(0|\+84)[0-9]{9,10}$/.test(val), {
          message: "Số điện thoại không hợp lệ",
        }),
      idcardNumberMother: z
        .string()
        .superRefine((val, ctx) => {
          // Chỉ validate nếu showGuardianInfo là true
          if (showMotherInfo) {
            // Kiểm tra không được để trống
            if (!val || val.trim().length === 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Số CCCD không được để trống",
              });
            }
            // Kiểm tra độ dài 12 ký tự
            else if (val.length !== 12) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Số CCCD phải có chính xác 12 chữ số",
              });
            }
            // Kiểm tra chỉ chứa chữ số
            else if (!/^\d+$/.test(val)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Số CCCD chỉ được chứa chữ số",
              });
            }
          }
          return z.NEVER;
        })
        .optional(),

      // Guardian information
      fullNameGuardian: z.string().superRefine((val, ctx) => {
        if (showGuardianInfo) {
          if (!val || val.trim().length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Họ và tên không được để trống",
            });
          } else if (val.length > 25) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Họ và tên tối đa 25 kí tự",
            });
          } else if (!/^[\p{L}\s]+$/u.test(val)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Họ và tên không được chứa số hoặc ký tự đặc biệt",
            });
          }
        }
        return z.NEVER;
      }),
      yearOfBirthGuardian: z
        .union([z.date(), z.null()])
        .refine((val) => !showGuardianInfo || val !== null, {
          message: "Vui lòng chọn ngày sinh",
        }),
      occupationGuardian: z.string().superRefine((val, ctx) => {
        if (showGuardianInfo) {
          if (!val || val.trim().length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Nghề nghiệp không được để trống",
            });
          } else if (val.length > 30) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Nghề nghiệp tối đa 30 kí tự",
            });
          } else if (!/^[\p{L}\s]+$/u.test(val)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Nghề nghiệp không được chứa số hoặc ký tự đặc biệt",
            });
          }
        }
        return z.NEVER;
      }),
      phoneNumberGuardian: z
        .string()
        .min(showGuardianInfo ? 1 : 0, "Số điện thoại không được để trống")
        .refine(
          (val) => !showGuardianInfo || /^(0|\+84)[0-9]{9,10}$/.test(val),
          {
            message: "Số điện thoại không hợp lệ",
          },
        ),
      emailGuardian: z
        .string()
        .email("Email không hợp lệ")
        .optional()
        .or(z.literal("")),
      idcardNumberGuardian: z
        .string()
        .superRefine((val, ctx) => {
          // Chỉ validate nếu showGuardianInfo là true
          if (showGuardianInfo) {
            // Kiểm tra không được để trống
            if (!val || val.trim().length === 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Số CCCD không được để trống",
              });
            }
            // Kiểm tra độ dài 12 ký tự
            else if (val.length !== 12) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Số CCCD phải có chính xác 12 chữ số",
              });
            }
            // Kiểm tra chỉ chứa chữ số
            else if (!/^\d+$/.test(val)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Số CCCD chỉ được chứa chữ số",
              });
            }
          }
          return z.NEVER;
        })
        .optional(),
    })
    .superRefine((val, ctx) => {
      // Kiểm tra ít nhất 1 checkbox được chọn
      if (!showFatherInfo && !showMotherInfo && !showGuardianInfo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Vui lòng chọn ít nhất 1 người thân (cha, mẹ hoặc người giám hộ)",
          path: ["familyInfoRequired"], // Tạo một path giả để hiển thị lỗi
        });
      }
    });

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName: "",
      gender: "",
      enrollmentType: "",
      classId: "",
      dob: null,
      admissionDate: null,

      permanentAddress: "",
      repeatingYear: false,
      status: "",
      // Father information
      fullNameFather: "",
      occupationFather: "",
      phoneNumberFather: "",
      emailFather: "",
      idcardNumberFather: "",
      yearOfBirthFather: null,
      // Mother information
      fullNameMother: "",
      occupationMother: "",
      phoneNumberMother: "",
      emailMother: "",
      yearOfBirthMother: null,
      // Guardian information
      fullNameGuardian: "",
      occupationGuardian: "",
      phoneNumberGuardian: "",
      emailGuardian: "",
      yearOfBirthGuardian: null,
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  // Submit handler

  const onSubmit = (formData) => {
    // if (!showFatherInfo && !showMotherInfo && !showGuardianInfo) {
    //   return;
    // }

    const cleanedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, cleanString(value)]),
    );
    const formattedData = {
      ...cleanedData,

      dob: formData.dob ? formatDate(formData.dob) : null,
      admissionDate: formData.admissionDate
        ? formatDate(formData.admissionDate)
        : null,
      yearOfBirthFather: formData.yearOfBirthFather
        ? formatDate(formData.yearOfBirthFather)
        : null,
      yearOfBirthMother: formData.yearOfBirthMother
        ? formatDate(formData.yearOfBirthMother)
        : null,
      yearOfBirthGuardian: formData.yearOfBirthGuardian
        ? formatDate(formData.yearOfBirthGuardian)
        : null,
      parentId: selectedSibling?.parent?.parentId || null,
    };
    console.log(formattedData);
    mutate(formattedData, {
      onSuccess: () => {
        // Reset form về giá trị mặc định
        reset({
          fullName: "",
          gender: "",
          enrollmentType: "",
          classId: "",
          dob: null,
          admissionDate: null,
          permanentAddress: "",
          repeatingYear: false,
          status: "",
          // Father information
          fullNameFather: "",
          occupationFather: "",
          phoneNumberFather: "",
          emailFather: "",
          idcardNumberFather: "",
          yearOfBirthFather: null,
          // Mother information
          fullNameMother: "",
          occupationMother: "",
          phoneNumberMother: "",
          emailMother: "",
          yearOfBirthMother: null,
          // Guardian information
          fullNameGuardian: "",
          occupationGuardian: "",
          phoneNumberGuardian: "",
          emailGuardian: "",
          yearOfBirthGuardian: null,
        });
        // Reset các state
        setShowFatherInfo(false);
        setShowMotherInfo(false);
        setShowGuardianInfo(false);
        setSelectedSibling(null);
        setSearchQuery("");
      },
    });
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
            defaultValue={watch(name) || ""}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder={`Chọn ${label?.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem
                      key={typeof option === "object" ? option.value : option}
                      value={typeof option === "object" ? option.value : option}
                    >
                      {typeof option === "object" ? option.label : option}
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
        onClick={() => navigate("/student/profile")}
        className="mt-2 cursor-pointer bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700"
      >
        Quay lại
      </Button>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto mt-4 space-y-6"
      >
        {/* Header with title and save button */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Thêm mới hồ sơ học sinh</h1>
          <Button
            type="submit"
            disabled={isUpdating}
            className="cursor-pointer bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700"
          >
            {isUpdating ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>

        {/* Basic Student Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin học sinh</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-4 md:col-span-2">
              <div className="flex-1">
                <FormField isRequired name="fullName" label="Họ và tên" />
              </div>
            </div>
            <FormField isRequired name="dob" label="Ngày sinh" type="date" />
            <FormField
              isRequired
              name="gender"
              label="Giới tính"
              type="select"
              options={["Nam", "Nữ", "Khác"]}
            />
            <FormField isRequired name="ethnicity" label="Dân tộc" />
            <FormField isRequired name="religion" label="Tôn giáo" />
            <FormField isRequired name="idcardNumber" label="CCCD/CMND" />
            <FormField
              isRequired
              name="classId"
              label="Lớp"
              type="select"
              options={
                classQuery.data?.map((c) => ({
                  value: c.classId.toString(),
                  label: c.className,
                })) || []
              }
            />
            <FormField
              isRequired
              name="status"
              label="Trạng thái"
              type="select"
              options={[
                "Đang học",
                "Bảo lưu",
                "Tốt nghiệp",
                "Nghỉ học",
                "Chuyển trường",
              ]}
            />
            <FormField
              isRequired
              name="enrollmentType"
              label="Hình thức trúng tuyển"
            />
            <FormField
              isRequired
              name="admissionDate"
              label="Ngày nhập học"
              type="date"
            />
            <FormField isRequired name="birthPlace" label="Nơi sinh" />
            <FormField
              isRequired
              name="permanentAddress"
              label="Địa chỉ thường trú"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="repeatingYear"
                {...register("repeatingYear")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="repeatingYear">Học sinh lưu ban</Label>
            </div>
          </CardContent>
        </Card>

        {/* Family Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin gia đình</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Checkbox selection */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showFatherInfo"
                  checked={showFatherInfo}
                  onChange={(e) => setShowFatherInfo(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="showFatherInfo">Thông tin cha</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showMotherInfo"
                  checked={showMotherInfo}
                  onChange={(e) => setShowMotherInfo(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="showMotherInfo">Thông tin mẹ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showGuardianInfo"
                  checked={showGuardianInfo}
                  onChange={(e) => setShowGuardianInfo(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="showGuardianInfo">Thông tin người bảo hộ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSiblingsModal(true)}
                >
                  Có anh/chị/em đang học
                </Button>
                {selectedSibling && (
                  <div className="flex items-center gap-2 rounded border bg-slate-50 px-4">
                    <span>
                      Đã chọn anh/chị/em: <b>{selectedSibling.fullName}</b> (Lớp{" "}
                      {selectedSibling.className})
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setSelectedSibling(null)}
                      className="ml-2"
                      title="Bỏ chọn"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {errors.familyInfoRequired && (
              <p className="text-sm text-red-500">
                {errors.familyInfoRequired.message}
              </p>
            )}

            {/* Father Information - chỉ hiển thị khi checkbox được chọn */}
            {showFatherInfo && (
              <div className="rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-semibold">Thông tin cha</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    isRequired
                    name="fullNameFather"
                    label="Họ và tên"
                  />
                  <FormField
                    isRequired
                    name="yearOfBirthFather"
                    label="Năm sinh"
                    type="date"
                  />
                  <FormField
                    isRequired
                    name="occupationFather"
                    label="Nghề nghiệp"
                  />
                  <FormField
                    isRequired
                    name="phoneNumberFather"
                    label="Số điện thoại"
                  />
                  <FormField name="emailFather" label="Email" />
                  <FormField
                    isRequired
                    name="idcardNumberFather"
                    label="CCCD/CMND"
                  />
                </div>
              </div>
            )}

            {/* Mother Information - chỉ hiển thị khi checkbox được chọn */}
            {showMotherInfo && (
              <div className="rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-semibold">Thông tin mẹ</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    isRequired
                    name="fullNameMother"
                    label="Họ và tên"
                  />
                  <FormField
                    isRequired
                    name="yearOfBirthMother"
                    label="Năm sinh"
                    type="date"
                  />
                  <FormField
                    isRequired
                    name="occupationMother"
                    label="Nghề nghiệp"
                  />
                  <FormField
                    isRequired
                    name="phoneNumberMother"
                    label="Số điện thoại"
                  />
                  <FormField name="emailMother" label="Email" />
                  <FormField
                    isRequired
                    name="idcardNumberMother"
                    label="CCCD/CMND"
                  />
                </div>
              </div>
            )}

            {/* Guardian Information - chỉ hiển thị khi checkbox được chọn */}
            {showGuardianInfo && (
              <div className="rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-semibold">
                  Thông tin người giám hộ
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    isRequired
                    name="fullNameGuardian"
                    label="Họ và tên"
                  />
                  <FormField
                    isRequired
                    name="yearOfBirthGuardian"
                    label="Năm sinh"
                    type="date"
                  />
                  <FormField
                    isRequired
                    name="occupationGuardian"
                    label="Nghề nghiệp"
                  />
                  <FormField
                    isRequired
                    name="phoneNumberGuardian"
                    label="Số điện thoại"
                  />
                  <FormField name="emailGuardian" label="Email" />
                  <FormField
                    isRequired
                    name="idcardNumberGuardian"
                    label="CCCD/CMND"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit button at bottom for convenience */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isUpdating}
            className="cursor-pointer bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700"
          >
            {isUpdating ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </form>
      <Dialog open={showSiblingsModal} onOpenChange={setShowSiblingsModal}>
        <DialogContent className="!w-full !max-w-fit">
          <DialogHeader>
            <DialogTitle>Danh sách học sinh</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Tìm kiếm theo tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-2"
            />
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="">
                  <tr className="bg-background sticky top-0 z-10 border-b">
                    <th className="p-2 text-left">Họ và tên</th>
                    <th className="p-2 text-left">Lớp</th>
                    <th className="p-2 text-left">Họ tên cha</th>
                    <th className="p-2 text-left">Họ tên mẹ</th>
                    <th className="p-2 text-left">Họ tên người bảo hộ</th>
                    <th className="p-2 text-left">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents && filteredStudents.length > 0 ? (
                    filteredStudents?.map((student) => (
                      <tr key={student.studentId} className="border-b">
                        <td className="w-50 p-2">{student.fullName}</td>
                        <td className="w-14 p-2">{student.className}</td>
                        <td className="w-50 p-2">
                          {student?.parent?.fullNameFather}
                        </td>
                        <td className="w-50 p-2">
                          {student?.parent?.fullNameMother}
                        </td>
                        <td className="w-50 p-2">
                          {student?.parent?.fullNameGuardian}
                        </td>
                        <td className="w-30 p-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowSiblingsModal(false);
                              handleChangeSibling(student);
                            }}
                          >
                            Chọn
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <td colSpan={10}>Đang tải dữ liệu</td>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
