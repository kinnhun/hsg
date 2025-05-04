import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLessonPlan, updateLessonPlan } from "./api";
import toast from "react-hot-toast";

export const useCreateLessonPlan = () => {
  return useMutation({
    mutationFn: createLessonPlan,
    onError: (error) => {
      const msg =
        error.response?.status === 401
          ? "Phiên đăng nhập đã hết hạn!"
          : `Tải lên thất bại: ${error.response?.data || "Lỗi hệ thống"}`;
      toast.error(msg);
    },
    onSuccess: () => {
      toast.success("Tải lên thành công!");
    },
  });
};

export const useUpdateLessonPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, data }) => updateLessonPlan(planId, data),
    onError: (error) => {
      const msg =
        error.response?.status === 401
          ? "Phiên đăng nhập đã hết hạn!"
          : `Cập nhật thất bại: ${error.response?.data || "Lỗi hệ thống"}`;
      toast.error(msg);
    },
    onSuccess: (data) => {
      toast.success("Cập nhật kế hoạch giảng dạy thành công!");
      queryClient.invalidateQueries({ queryKey: ["lessonPlansByTeacher"] });
      queryClient.invalidateQueries({ queryKey: ["lessonPlan"] });
    },
  });
};
