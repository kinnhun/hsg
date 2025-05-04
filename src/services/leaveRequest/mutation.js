import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import {
  createLeaveRequest,
  deleteLeaverRequestById,
  updateLeaveRequestById,
  substituteTeacher,
} from "./api";

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: (data) => {
      toast.success(
        data?.message || "Yêu cầu nghỉ phép đã được gửi thành công!",
      );
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi gửi yêu cầu nghỉ phép.";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLeaverRequestById,
    onSuccess: (data) => {
      toast.success(
        data?.message || "Yêu cầu nghỉ phép đã được xóa thành công!",
      );
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi xóa yêu cầu nghỉ phép.";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateLeaveRequestById(id, data),
    onSuccess: (data) => {
      toast.success(
        data?.message || "Yêu cầu nghỉ phép đã được cập nhật thành công!",
      );
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi cập nhật yêu cầu nghỉ phép.";
      toast.error(errorMessage);
    },
  });
};

export const useSubstituteTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => substituteTeacher(payload),
    onSuccess: (data) => {
      toast.success(
        data?.message || "Phân công giáo viên thay thế thành công!",
      );
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      queryClient.invalidateQueries({ queryKey: ["substituteTeachings"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi phân công giáo viên thay thế.";
      toast.error(errorMessage);
    },
  });
};
