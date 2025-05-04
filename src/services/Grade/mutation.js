import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getGrades, updateGrades } from "./api";

// Mutation hook để tạo mới grade
export const getGradesGradeMutation = () => {
  return useMutation({
    mutationFn: (data) => getGrades(data),
    onSettled: (data, error) => {
      if (error) {
        console.log(error);
        toast.error(error.message);
      }
    },
  });
};

// Mutation hook để cập nhật grade
export const useUpdateGradeMutation = () => {
  return useMutation({
    mutationFn: (data) => updateGrade(data),
    onSettled: (data, error) => {
      if (error) {
        console.log(error);
        toast.error(error.message);
      } else {
        toast.success("Cập nhật điểm số thành công");
      }
    },
  });
};
