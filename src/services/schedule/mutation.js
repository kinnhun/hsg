import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getScheduleByTeacherId,
  getScheduleByStudent,
  deleteTimeTableDetail,
  updateTimeTableDetail,
  createTimeTableDetail,
  updateTimetableInfo,
  createTimetable,
} from "./api";
import toast from "react-hot-toast";

export function useGetScheduleByTeacherId() {
  return useMutation({
    mutationFn: getScheduleByTeacherId,
  });
}

export function useGetScheduleByStudent() {
  return useMutation({
    mutationFn: getScheduleByStudent,
  });
}

export function useDeleteTimeTableDetail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTimeTableDetail,
    onSuccess: () => {
      queryClient.invalidateQueries(["timetable"]);
      toast.success("Xóa thời khóa biểu thành công");
    },
    onError: (error) => {
      console.error("Lỗi khi xóa thời khóa biểu:", error);
      toast.error("Có lỗi xảy ra khi xóa thời khóa biểu");
    },
  });
}

export function useUpdateTimeTableDetail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTimeTableDetail,
    onSuccess: () => {
      queryClient.invalidateQueries(["timetable"]);
      toast.success("Cập nhật thời khóa biểu thành công");
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật thời khóa biểu:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thời khóa biểu");
    },
  });
}

export function useCreateTimeTableDetail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTimeTableDetail,
    onSuccess: () => {
      queryClient.invalidateQueries(["timetable"]);
      toast.success("Tạo thời khóa biểu thành công");
    },
    onError: (error) => {
      console.error("Lỗi khi tạo thời khóa biểu:", error);
      toast.error("Có lỗi xảy ra khi tạo thời khóa biểu");
    },
  });
}

export function useUpdateTimetableInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTimetableInfo,
    onSuccess: () => {
      queryClient.invalidateQueries(["timetables"]);
      toast.success("Cập nhật thông tin thời khóa biểu thành công");
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật thông tin thời khóa biểu:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin thời khóa biểu");
    },
  });
}

export function useCreateTimetable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTimetable,
    onSuccess: () => {
      queryClient.invalidateQueries(["timetables"]);
      toast.success("Tạo thời khóa biểu thành công");
    },
    onError: (error) => {
      console.error("Lỗi khi tạo thời khóa biểu:", error);
      toast.error("Có lỗi xảy ra khi tạo thời khóa biểu");
    },
  });
}
