import { useQuery } from "@tanstack/react-query";
import { getLessonPlanByTeacher, getLessonPlanById } from "./api";

export function useLessonPlanByTeacher(teacherId, pageNumber, pageSize) {
  return useQuery({
    queryKey: ["lessonPlansByTeacher", teacherId, pageNumber, pageSize],
    queryFn: () => getLessonPlanByTeacher(teacherId, pageNumber, pageSize),
    enabled: !!teacherId,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
}

export const useLessonPlanById = (planId) => {
  return useQuery({
    queryKey: ["lessonPlan", planId],
    queryFn: () => getLessonPlanById(planId),
    enabled: !!planId,
    onError: (error) => {
      const msg =
        error.response?.status === 401
          ? "Phiên đăng nhập đã hết hạn!"
          : `Không thể tải chi tiết giáo án: ${error.response?.data || "Lỗi hệ thống"}`;
      toast.error(msg);
    },
  });
};
