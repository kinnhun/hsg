import { useQuery } from "@tanstack/react-query";
import {
  getLeaveRequestByTeacherId,
  getLeaveRequestByAdmin,
  getLeaveRequestById,
} from "./api";

export const useGetLeaveRequestByTeacherId = (teacherId, status) => {
  return useQuery({
    queryKey: ["leaveRequests", "teacher", teacherId, status],
    queryFn: () => getLeaveRequestByTeacherId(teacherId, status),
    enabled: !!teacherId,
  });
};

export const useGetLeaveRequestByAdmin = () => {
  return useQuery({
    queryKey: ["leaveRequests", "admin"],
    queryFn: getLeaveRequestByAdmin,
  });
};
export const useGetLeaveRequestById = (id) => {
  return useQuery({
    queryKey: ["leaveRequests", "id", id],
    queryFn: () => getLeaveRequestById(id),
    enabled: !!id,
  });
};
