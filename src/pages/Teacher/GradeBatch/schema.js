import { z } from "zod";

export const addGradeSchema = z
  .object({
    batchName: z.string().min(1, "Tên đợt không được để trống"),
    startDate: z.date({ required_error: "Vui lòng chọn ngày bắt đầu" }),
    endDate: z.date({ required_error: "Vui lòng chọn ngày kết thúc" }),
    active: z.boolean().default(true),
    assessmentTypes: z.object({
      frequent: z.object({
        enabled: z.boolean(),
        count: z.string().optional(),
      }),
      midterm: z.object({
        enabled: z.boolean(),
      }),
      final: z.object({
        enabled: z.boolean(),
      }),
    }),
    subjectIds: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một môn học"),
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.endDate >= data.startDate,
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      const { frequent, midterm, final } = data.assessmentTypes;
      return frequent.enabled || midterm.enabled || final.enabled;
    },
    {
      message: "Vui lòng chọn ít nhất một loại điểm",
      path: ["assessmentTypes"],
    },
  );
