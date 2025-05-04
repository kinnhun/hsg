import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTeacher,
  deleteTeacher,
  importTeachers,
  takeAttendance,
  updateTeacher,
  uploadExam,
} from "./api";

import toast from "react-hot-toast";

export function useImportTeachers() {
  return useMutation({
    mutationFn: (fileExcel) => importTeachers(fileExcel),
    onSettled: (data, error) => {
      if (error) {
        if (error.response?.data?.message) {
          toast.error(error.response?.data?.message);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        toast.success("Import giáo viên thành công");
      }
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateTeacher(id, data),

    onSettled: (data, error, inputData) => {
      if (error) {
        console.log(error);
        if (error.response?.data?.message) {
          toast.error(error.response?.data?.message);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log("cập nhật thành công");
        queryClient.invalidateQueries("teacher", inputData.id);
        toast.success("Cập nhật thành công");
      }
    },
  });
}

export function useCreateTeacher() {
  return useMutation({
    mutationFn: (data) => createTeacher(data),
    onSettled: (data, error) => {
      if (error) {
        console.log(error);
        if (error.response?.data?.message) {
          toast.error(error.response?.data?.message);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        console.log("tạo mới thành công");
        toast.success("Thêm giáo viên thành công");
      }
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteTeacher(id),
    onSettled: (data, error) => {
      if (error) {
        console.log(error);
        if (error.response?.data?.message) {
          toast.error(error.response?.data?.message);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        console.log("xóa thành công");
        toast.success("Xóa thành công");
        queryClient.invalidateQueries("teachers");
      }
    },
  });
}

export function useUploadExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => uploadExam(data),
    onSettled: (data, error, variables) => {
      if (error) {
        console.log(error);
        if (error.response?.data?.message) {
          toast.error(error.response?.data?.message);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        toast.success("Tải lên đề thi thành công");
        const teacherId = variables.get("TeacherId");
        queryClient.invalidateQueries(["exams-by-teacher-id", { teacherId }]);
      }
    },
  });
}

export function useTakeAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => takeAttendance(data),
    onSettled: (data, error, variables) => {
      if (error) {
        console.log(error);

        if (error.response?.data?.message) {
          toast.error(error.response?.data?.message);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        toast.success("Điểm danh thành công");
        queryClient.invalidateQueries([
          "student-attendances",
          {
            teacherId: variables.teacherId,
            classId: variables.classId,
            semesterId: variables.semesterId,
          },
        ]);
      }
    },
  });
}
